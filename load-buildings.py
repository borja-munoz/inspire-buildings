import argparse
import csv
import glob
import json
import logging
import os
import zipfile

import requests
import xmltodict

import fiona
from fiona.transform import transform_geom
from shapely.geometry import shape, mapping

from google.cloud import bigquery
from google.cloud import storage
from google.oauth2 import service_account

def download_file(url, file_name):
    with open(file_name, "wb") as file:
        response = requests.get(url)
        file.write(response.content)

def unzip_file(file_name):
    try:
        with zipfile.ZipFile(file_name) as z:
            z.extractall('tmp')
    except:
        print("Invalid file")

def download_building_files():

    gml_files = []

    root_file_url = 'http://www.catastro.minhap.es/INSPIRE/buildings/ES.SDGC.BU.atom.xml'

    response = requests.get(root_file_url)
    root_data = xmltodict.parse(response.content)

    for territorial_office in root_data['feed']['entry']:
        response = requests.get(territorial_office['id'])
        territorial_office_data = xmltodict.parse(response.content)
        for municipality in territorial_office_data['feed']['entry']:
            url_file = municipality['id']
            first_position = url_file.rfind("/")
            last_position = len(url_file)
            file_name = url_file[first_position+1:last_position]
            download_file(url_file, 'tmp/{0}'.format(file_name))
            unzip_file('tmp/{0}'.format(file_name))
            gml_files.append('tmp/{0}'.format(file_name).replace('zip', 'building.gml'))
            print("Data downloaded and extracted for " + municipality['title'])
        break

    return gml_files

def remove_temp_files():
    file_extensions = ['gfs', 'gml', 'xml', 'zip']
    for file_extension in file_extensions:
        file_list = glob.glob('tmp/*.{0}'.format(file_extension))
        for file_path in file_list:
            os.remove(file_path)

def create_csv_file(file_name, output_file):
    row = 0
    with fiona.open(file_name, "r") as source:
        with open(output_file, "w") as file:
            writer = csv.writer(file, delimiter=",", lineterminator="\n")
            firstRow = True
            for f in source:
                try:
                    if firstRow:
                        writer.writerow(
                            ['geom'] + 
                            list(f["properties"].keys())
                        )
                        firstRow = False
                    polygon = shape(transform_geom(source.crs, 'EPSG:4326', f["geometry"]))                    
                    writer.writerow(
                        [json.dumps(mapping(polygon))] +
                        list(f["properties"].values())
                    )
                    row += 1
                except Exception:
                    logging.exception("Error processing feature %s:", f["id"])
                    break

def upload_file(file_name, bucket_id, credentials):
    client = storage.Client(credentials=credentials, project=credentials.project_id)
    bucket = client.get_bucket(bucket_id)
    blob = bucket.blob(file_name)
    blob.upload_from_filename(filename='{0}'.format(file_name))

def get_schema():
    return [
        bigquery.SchemaField("geom", "GEOGRAPHY"),
        bigquery.SchemaField("gml_id", "STRING"),
        bigquery.SchemaField("beginLifespanVersion", "TIMESTAMP"),
        bigquery.SchemaField("conditionOfConstruction", "STRING"),
        bigquery.SchemaField("beginning", "STRING"),
        bigquery.SchemaField("end", "STRING"),
        bigquery.SchemaField("endLifespanVersion", "TIMESTAMP"),
        bigquery.SchemaField("informationSystem", "STRING"),
        bigquery.SchemaField("reference", "STRING"),
        bigquery.SchemaField("localId", "STRING"),
        bigquery.SchemaField("namespace", "STRING"),
        bigquery.SchemaField("horizontalGeometryEstimatedAccuracy", "FLOAT"),
        bigquery.SchemaField("horizontalGeometryEstimatedAccuracy_uom", "STRING"),
        bigquery.SchemaField("horizontalGeometryReference", "STRING"),
        bigquery.SchemaField("referenceGeometry", "BOOLEAN"),
        bigquery.SchemaField("currentUse", "STRING"),
        bigquery.SchemaField("numberOfBuildingUnits", "INTEGER"),
        bigquery.SchemaField("numberOfDwellings", "INTEGER"),
        bigquery.SchemaField("numberOfFloorsAboveGround", "STRING"),
        bigquery.SchemaField("documentLink", "STRING"),
        bigquery.SchemaField("format", "STRING"),
        bigquery.SchemaField("sourceStatus", "STRING"),
        bigquery.SchemaField("officialAreaReference", "STRING"),
        bigquery.SchemaField("value", "INTEGER"),
        bigquery.SchemaField("value_uom", "STRING")
    ]

def load_data_bigquery(file_name, table_id, credentials):

    client = bigquery.Client(credentials=credentials, project=credentials.project_id)

    job_config = bigquery.LoadJobConfig(
        schema=get_schema(),
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        source_format=bigquery.SourceFormat.CSV,
        skip_leading_rows=1
    )

    uri = 'gs://' + file_name
    load_job = client.load_table_from_uri(
        uri, table_id, job_config=job_config
    )  

    load_job.result()  # Waits for the job to complete.

    destination_table = client.get_table(table_id)
    print("Loaded {} rows.".format(destination_table.num_rows))

def main(bucket_id, table_id, service_account_file):

    # Load Google Cloud credentials from the service account file
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file, 
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )

    # Download building files from Spanish Cadastre
    gml_file_names = download_building_files()

    # Transform the files to CSV with GeoJSON, upload them to GCS
    # and load them in BigQuery
    for gml_file_name in gml_file_names:

        csv_file_name = gml_file_name.replace('gml', 'csv')
        create_csv_file(gml_file_name, csv_file_name)
        print('CSV file created: {0}'.format(csv_file_name))

        bucket_file_name = bucket_id + '/' + csv_file_name
        upload_file(csv_file_name, bucket_id, credentials)
        print('CSV file uploaded to GCS: {0}'.format(csv_file_name))

        load_data_bigquery(bucket_file_name, table_id, credentials)
        print('CSV file loaded in BigQuery: {0}'.format(csv_file_name))
    
    remove_temp_files()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("bucket_id", help="GCS Bucket where data will be uploaded.")
    parser.add_argument("table_id", help="BigQuery table where data will be loaded.")
    parser.add_argument("service_account_file", help="Path to file with service account credentials.")
    args = parser.parse_args()

    main(
        args.bucket_id, 
        args.table_id, 
        args.service_account_file
    )
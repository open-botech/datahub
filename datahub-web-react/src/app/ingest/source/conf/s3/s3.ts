import { SourceConfig } from '../types';
import s3Logo from '../../../../../images/s3logo.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: glue
  config:
    aws_region: "us-west-2"
    env: "PROD"

    # Filtering patterns for databases and tables to scan
    database_pattern:
      allow:
        - "flights-database"
    table_pattern:
        allow:
        - "avro"

    # Credentials. If not specified here, these are picked up according to boto3 rules.
    # (see https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html)
    aws_access_key_id: # Optional.
    aws_secret_access_key: # Optional.
    aws_session_token: # Optional.
    aws_role: # Optional (Role chaining supported by using a sorted list).
sink: 
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const s3Config: SourceConfig = {
    type: 's3',
    placeholderRecipe,
    displayName: 'S3',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/s3/',
    logoUrl: s3Logo,
};

export default s3Config;

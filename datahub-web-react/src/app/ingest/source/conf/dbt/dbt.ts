import { SourceConfig } from '../types';
import dbtLogo from '../../../../../images/dbtlogo.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: "dbt"
  config:
    # Coordinates
    manifest_path: "./path/dbt/manifest_file.json"
    catalog_path: "./path/dbt/catalog_file.json"
    sources_path: "./path/dbt/sources_file.json"

    # Options
    target_platform: "my_target_platform_id" # e.g. bigquery/postgres/etc.
    load_schemas: True # note: if this is disabled

sink:
  # sink configs
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const dbtConfig: SourceConfig = {
    type: 'dbt',
    placeholderRecipe,
    displayName: 'dbt',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/dbt/',
    logoUrl: dbtLogo,
};

export default dbtConfig;

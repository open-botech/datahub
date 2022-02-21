import { SourceConfig } from '../types';
import redashLogo from '../../../../../images/redashlogo.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: "redash"
  config:
    connect_uri: http://localhost:5000/
    api_key: REDASH_API_KEY

    # Optionals
    # api_page_limit: 1 #default: None, no limit on ingested dashboards and charts API pagination
    # skip_draft: true  #default: true, only ingest published dashboards and charts
    # dashboard_patterns:
    #   deny:
    #     - ^denied dashboard.*
    #   allow:
    #     - .*allowed dashboard.*
    # chart_patterns:
    #   deny:
    #     - ^denied chart.*
    #   allow:
    #     - .*allowed chart.*
    # parse_table_names_from_sql: false
sink: 
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const redashConfig: SourceConfig = {
    type: 'redash',
    placeholderRecipe,
    displayName: 'Redash',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/redash/',
    logoUrl: redashLogo,
};

export default redashConfig;

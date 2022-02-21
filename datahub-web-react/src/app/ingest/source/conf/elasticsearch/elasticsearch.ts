import { SourceConfig } from '../types';
import elasticsearchLogo from '../../../../../images/elasticsearchlogo.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: "elasticsearch"
  config:
    # Coordinates
    host: 'localhost:9200'
    # Credentials
    username: ""
    password: ""
    # Options
    env: "PROD"
    index_pattern:
        allow: [".*some_index_name_pattern*"]
        deny: [".*skip_index_name_pattern*"]
sink:
  # sink configs

    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const elasticsearchConfig: SourceConfig = {
    type: 'elasticsearch',
    placeholderRecipe,
    displayName: 'Elasticsearch',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/elasticsearch/',
    logoUrl: elasticsearchLogo,
};

export default elasticsearchConfig;

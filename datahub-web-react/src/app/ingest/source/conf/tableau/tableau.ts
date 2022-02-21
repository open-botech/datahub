import { SourceConfig } from '../types';
import tableauLogo from '../../../../../images/tableaulogo.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: tableau
  config:
    # Coordinates
    connect_uri: https://prod-ca-a.online.tableau.com
    site: acryl
    projects: ["default", "Project 2"]
    
    # Credentials
    username: username@acrylio.com
    password: pass
    token_name: Acryl
    token_value: token_generated_from_tableau
    
    # Options
    ingest_tags: True
    ingest_owner: True
    default_schema_map:
      mydatabase: public
      anotherdatabase: anotherschema
    
sink:
    # sink configs
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const tableauConfig: SourceConfig = {
    type: 'tableau',
    placeholderRecipe,
    displayName: 'Tableau',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/tableau/',
    logoUrl: tableauLogo,
};

export default tableauConfig;

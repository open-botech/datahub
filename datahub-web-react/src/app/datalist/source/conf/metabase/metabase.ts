import { SourceConfig } from '../types';
import metabaseLogo from '../../../../../images/metabaselogo.png';
import icon from '../../../../../images/metabase.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: metabase
  config:
    # Coordinates
    connect_uri: http://localhost:3000

    # Credentials
    username: user
    password: pass
    
    # Options
    default_schema: public
    database_alias_map:
      h2: sample-dataset.db
    # Optional mapping of platform types to instance ids
    platform_instance_map: # optional
      postgres: test_postgres    # optional

sink:

    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const metabaseConfig: SourceConfig = {
    type: 'metabase',
    placeholderRecipe,
    displayName: 'Metabase',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/metabase/',
    logoUrl: metabaseLogo,
    icon
};

export default metabaseConfig;

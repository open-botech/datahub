import { SourceConfig } from '../types';
import mssqlLogo from '../../../../../images/mssqllogo.png';
import icon from '../../../../../images/mssql.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: mssql
  config:
    # Coordinates
    host_port: localhost:1433
    database: DemoDatabase

    # Credentials
    username: user
    password: pass

sink:
    # sink configs
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const mssqlConfig: SourceConfig = {
    type: 'mssql',
    placeholderRecipe,
    displayName: 'MSSQL',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/mssql/',
    logoUrl: mssqlLogo,
    icon
};

export default mssqlConfig;

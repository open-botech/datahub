import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';
import { PageRoutes } from '../conf/Global';
import { HomePage } from './home/HomePage';
import AppConfigProvider from '../AppConfigProvider';
import { SearchRoutes } from './SearchRoutes';
import { DataListPage } from './datalist/DataListPage';

/**
 * Container for all views behind an authentication wall.
 */
export const ProtectedRoutes = (): JSX.Element => {
    return (
        <AppConfigProvider>
            <Layout style={{ height: '100%', width: '100%' }}>
                <Layout>
                    <Switch>
                        <Route exact path="/" render={() => <HomePage />} />
                        <Route path={PageRoutes.DATALIST} render={() => <DataListPage />} />
                        <Route path="/*" render={() => <SearchRoutes />} />
                    </Switch>
                </Layout>
            </Layout>
        </AppConfigProvider>
    );
};

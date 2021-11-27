import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IconButton, mergeStyles, mergeStyleSets, Nav, Stack, StackItem } from '@fluentui/react';
import { Adb } from '@yume-chan/adb';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Redirect, useLocation } from 'react-router-dom';
import { AdbEventLogger, CacheRoute, CacheSwitch, Connect, ErrorDialogProvider, Logger, LoggerContextProvider, ToggleLogger } from './components';
import './index.css';
import { AdbDeviceProvider, DeviceInfo, FileManagerRoute, FrameBuffer, Install, Intro, Scrcpy, Shell, TcpIp } from './routes';

initializeIcons();

const classNames = mergeStyleSets({
    'title-container': {
        borderBottom: '1px solid rgb(243, 242, 241)',
    },
    title: {
        padding: '4px 0',
        fontSize: 20,
        textAlign: 'center',
    },
    'left-column': {
        width: 250,
        paddingRight: 8,
        borderRight: '1px solid rgb(243, 242, 241)',
        overflow: 'auto',
    },
    'right-column': {
        borderLeft: '1px solid rgb(243, 242, 241)',
    }
});

interface RouteInfo {
    path: string;

    exact?: boolean;

    name: string;

    children: JSX.Element | null;

    noCache?: boolean;
}

function App(): JSX.Element | null {
    const location = useLocation();

    const [logger] = useState(() => new AdbEventLogger());
    const [device, setDevice] = useState<Adb | undefined>();

    const [leftPanelVisible, setLeftPanelVisible] = useState(() => innerWidth > 650);
    const toggleLeftPanel = useCallback(() => {
        setLeftPanelVisible(value => !value);
    }, []);


    const routes = useMemo((): RouteInfo[] => [
        {
            path: '/',
            name: 'ADB over WiFi',
            children: (
                <TcpIp />
            )
        },
    ], [device]);

    return (
        <LoggerContextProvider>
            <Stack verticalFill>
                <Stack className={classNames['title-container']} horizontal verticalAlign="center">
                    <StackItem grow>
                        <div className={classNames.title}>kPhone Dashboard</div>
                    </StackItem>
                </Stack>

                <Stack grow horizontal verticalFill disableShrink styles={{ root: { minHeight: 0, overflow: 'hidden', lineHeight: '1.5' } }}>
                    <StackItem className={mergeStyles(classNames['left-column'], !leftPanelVisible && { display: 'none' })}>
                        <Connect
                            device={device}
                            logger={logger.logger}
                            onDeviceChange={setDevice}
                        />

                    </StackItem>

                    <StackItem grow styles={{ root: { width: 0 } }}>
                        <AdbDeviceProvider value={device}>
                            <CacheRoute
                                exact={undefined}
                                path='/'
                                noCache={true}>
                                <TcpIp />
                            </CacheRoute>
                        </AdbDeviceProvider>
                    </StackItem>

                    <Logger className={classNames['right-column']} logger={logger} />
                </Stack>
            </Stack>
        </LoggerContextProvider>
    );
}

ReactDOM.render(
    <HashRouter>
        <ErrorDialogProvider>
            <App />
        </ErrorDialogProvider>
    </HashRouter>,
    document.getElementById('container')
);

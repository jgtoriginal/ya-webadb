import { MessageBar, StackItem, Text, TextField, Toggle } from '@fluentui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandBar } from '../components';
import { withDisplayName } from '../utils';
import { useAdbDevice } from './type';

export const TcpIp = withDisplayName('TcpIp')((): JSX.Element | null => {
    const device = useAdbDevice();

    const [serviceListenAddrs, setServiceListenAddrs] = useState<string[] | undefined>();

    const [servicePortEnabled, setServicePortEnabled] = useState<boolean>(false);
    const [servicePort, setServicePort] = useState<string>('');

    const [persistPortEnabled, setPersistPortEnabled] = useState<boolean>(false);
    const [persistPort, setPersistPort] = useState<string>();

    const queryTcpIpInfo = useCallback(() => {
        if (!device) {
            setServiceListenAddrs(undefined);

            setServicePortEnabled(false);
            setServicePort('');

            setPersistPortEnabled(false);
            setPersistPort(undefined);
            return;
        }

        (async () => {
            const listenAddrs = await device.getProp('service.adb.listen_addrs');
            if (listenAddrs) {
                setServiceListenAddrs(listenAddrs.split(','));
            } else {
                setServiceListenAddrs(undefined);
            }

            const servicePort = await device.getProp('service.adb.tcp.port');
            if (servicePort) {
                setServicePortEnabled(!listenAddrs && servicePort !== '0');
                setServicePort(servicePort);
            } else {
                setServicePortEnabled(false);
                setServicePort('5555');
            }

            const persistPort = await device.getProp('persist.adb.tcp.port');
            if (persistPort) {
                setPersistPortEnabled(!listenAddrs && !servicePort);
                setPersistPort(persistPort);
            } else {
                setPersistPortEnabled(false);
                setPersistPort(undefined);
            }
        })();
    }, [device]);

    useEffect(() => {
        queryTcpIpInfo();
    }, [queryTcpIpInfo]);

    const applyServicePort = useCallback(() => {
        if (!device) {
            return;
        }

        (async () => {
            if (servicePortEnabled) {
                await device.tcpip.setPort(Number.parseInt(servicePort, 10));
            } else {
                await device.tcpip.disable();
            }
        })();
    }, [device, servicePortEnabled, servicePort]);

    const commandBarItems = useMemo(() => [
        {
            key: 'refresh',
            disabled: !device,
            iconProps: { iconName: 'Refresh' },
            text: 'Refresh',
            onClick: queryTcpIpInfo,
        },
        {
            key: 'apply',
            disabled: !device,
            iconProps: { iconName: 'Save' },
            text: 'Apply',
            onClick: applyServicePort,
        }
    ], [device, queryTcpIpInfo, applyServicePort]);

    const handleServicePortEnabledChange = useCallback((e, value?: boolean) => {
        setServicePortEnabled(!!value);
    }, []);

    const handleServicePortChange = useCallback((e, value?: string) => {
        if (value === undefined) {
            return;
        }
        setServicePort(value);
    }, []);

    return (
        <>
            <CommandBar items={commandBarItems} />
            <StackItem>
                <Toggle
                    inlineLabel
                    label="Turn on kPhone app on my device"
                    checked={servicePortEnabled}
                    disabled={!device || !!serviceListenAddrs}
                    onText="Enabled"
                    offText="Disabled"
                    onChange={handleServicePortEnabledChange}
                />
            </StackItem>
        </>
    );
});

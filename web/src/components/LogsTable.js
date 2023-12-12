import React, {useEffect, useState} from 'react';
import {Label} from 'semantic-ui-react';
import {API, copy, isAdmin, showError, showSuccess, timestamp2string} from '../helpers';

import {Table, Avatar, Tag, Form, Button, Layout, Select, Popover, Modal} from '@douyinfe/semi-ui';
import {ITEMS_PER_PAGE} from '../constants';
import {renderNumber, renderQuota, stringToColor} from '../helpers/render';
import {
    IconAt,
    IconHistogram,
    IconGift,
    IconKey,
    IconUser,
    IconLayers,
    IconSetting,
    IconCreditCard,
    IconSemiLogo,
    IconHome,
    IconMore
} from '@douyinfe/semi-icons';

const {Sider, Content, Header} = Layout;
const {Column} = Table;


function renderTimestamp(timestamp) {
    return (
        <>
            {timestamp2string(timestamp)}
        </>
    );
}

const MODE_OPTIONS = [
    {key: 'all', text: '全部用户', value: 'all'},
    {key: 'self', text: '当前用户', value: 'self'}
];

const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]

function renderType(type) {
    switch (type) {
        case 1:
            return <Tag color='cyan' size='large'> 充值 </Tag>;
        case 2:
            return <Tag color='lime' size='large'> 消费 </Tag>;
        case 3:
            return <Tag color='orange' size='large'> 管理 </Tag>;
        case 4:
            return <Tag color='purple' size='large'> 系统 </Tag>;
        default:
            return <Tag color='black' size='large'> 未知 </Tag>;
    }
}

const LogsTable = () => {
    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp2string',
        },
        {
            title: '渠道',
            dataIndex: 'channel',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                    isAdminUser ?
                        record.type === 0 || record.type === 2 ?
                            <div>
                                {<Tag color={colors[parseInt(text) % colors.length]} size='large'> {text} </Tag>}
                            </div>
                            :
                            <></>
                        :
                        <></>
                );
            },
        },
        {
            title: '用户',
            dataIndex: 'username',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                    isAdminUser ?
                        <div>
                            <Avatar size="small" color={stringToColor(text)} style={{marginRight: 4}}
                                    onClick={() => showUserInfo(record.user_id)}>
                                {typeof text === 'string' && text.slice(0, 1)}
                            </Avatar>
                            {text}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '令牌',
            dataIndex: 'token_name',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            <Tag color='grey' size='large' onClick={() => {
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '类型',
            dataIndex: 'type',
            render: (text, record, index) => {
                return (
                    <div>
                        {renderType(text)}
                    </div>
                );
            },
        },
        {
            title: '模型',
            dataIndex: 'model_name',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            <Tag color={stringToColor(text)} size='large' onClick={() => {
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '提示',
            dataIndex: 'prompt_tokens',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '补全',
            dataIndex: 'completion_tokens',
            render: (text, record, index) => {
                return (
                    parseInt(text) > 0 && (record.type === 0 || record.type === 2) ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '花费',
            dataIndex: 'quota',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {
                                renderQuota(text, 6)
                            }
                        </div>
                        :
                        <></>
                );
            }
        },
        {
            title: '详情',
            dataIndex: 'content',
        }
    ];

    const [logs, setLogs] = useState([]);
    const [showStat, setShowStat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searching, setSearching] = useState(false);
    const [logType, setLogType] = useState(0);
    const isAdminUser = isAdmin();
    let now = new Date();
    // 初始化start_timestamp为前一天
    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(now.getTime() / 1000 - 86400),
        end_timestamp: timestamp2string(now.getTime() / 1000 + 3600),
        channel: ''
    });
    const {username, token_name, model_name, start_timestamp, end_timestamp, channel} = inputs;

    const [stat, setStat] = useState({
        quota: 0,
        token: 0
    });

    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const getLogSelfStat = async () => {
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        let res = await API.get(`/api/log/self/stat?type=${logType}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`);
        const {success, message, data} = res.data;
        if (success) {
            setStat(data);
        } else {
            showError(message);
        }
    };

    const getLogStat = async () => {
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        let res = await API.get(`/api/log/stat?type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}`);
        const {success, message, data} = res.data;
        if (success) {
            setStat(data);
        } else {
            showError(message);
        }
    };

    const handleEyeClick = async () => {
        if (!showStat) {
            if (isAdminUser) {
                await getLogStat();
            } else {
                await getLogSelfStat();
            }
        }
        setShowStat(!showStat);
    };

    const showUserInfo = async (userId) => {
        if (!isAdminUser) {
            return;
        }
        const res = await API.get(`/api/user/${userId}`);
        const {success, message, data} = res.data;
        if (success) {
            Modal.info({
                title: '用户信息',
                content: <div style={{padding: 12}}>
                    <p>用户名: {data.username}</p>
                    <p>余额: {renderQuota(data.quota)}</p>
                    <p>已用额度：{renderQuota(data.used_quota)}</p>
                    <p>请求次数：{renderNumber(data.request_count)}</p>
                </div>,
                centered: true,
            })
        } else {
            showError(message);
        }
    };

    const setLogsFormat = (logs) => {
        for (let i = 0; i < logs.length; i++) {
            logs[i].timestamp2string = timestamp2string(logs[i].created_at);
            logs[i].key = '' + logs[i].id;
        }
        // data.key = '' + data.id
        setLogs(logs);
        setLogCount(logs.length + ITEMS_PER_PAGE);
        console.log(logCount);
    }

    const loadLogs = async (startIdx) => {
        setLoading(true);

        let url = '';
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        if (isAdminUser) {
            url = `/api/log/?p=${startIdx}&type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}`;
        } else {
            url = `/api/log/self/?p=${startIdx}&type=${logType}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
        }
        const res = await API.get(url);
        const {success, message, data} = res.data;
        if (success) {
            if (startIdx === 0) {
                setLogsFormat(data);
            } else {
                let newLogs = [...logs];
                newLogs.splice(startIdx * ITEMS_PER_PAGE, data.length, ...data);
                setLogsFormat(newLogs);
            }
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const pageData = logs.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

    const handlePageChange = page => {
        setActivePage(page);
        if (page === Math.ceil(logs.length / ITEMS_PER_PAGE) + 1) {
            // In this case we have to load more data and then append them.
            loadLogs(page - 1).then(r => {
            });
        }
    };

    const refresh = async () => {
        // setLoading(true);
        setActivePage(1);
        await loadLogs(0);
    };

    const copyText = async (text) => {
        if (await copy(text)) {
            showSuccess('已复制：' + text);
        } else {
            // setSearchKeyword(text);
            Modal.error({title: '无法复制到剪贴板，请手动复制', content: text});
        }
    }

    useEffect(() => {
        refresh().then();
    }, [logType]);

    const searchLogs = async () => {
        if (searchKeyword === '') {
            // if keyword is blank, load files instead.
            await loadLogs(0);
            setActivePage(1);
            return;
        }
        setSearching(true);
        const res = await API.get(`/api/log/self/search?keyword=${searchKeyword}`);
        const {success, message, data} = res.data;
        if (success) {
            setLogs(data);
            setActivePage(1);
        } else {
            showError(message);
        }
        setSearching(false);
    };

    const handleKeywordChange = async (e, {value}) => {
        setSearchKeyword(value.trim());
    };

    const sortLog = (key) => {
        if (logs.length === 0) return;
        setLoading(true);
        let sortedLogs = [...logs];
        if (typeof sortedLogs[0][key] === 'string') {
            sortedLogs.sort((a, b) => {
                return ('' + a[key]).localeCompare(b[key]);
            });
        } else {
            sortedLogs.sort((a, b) => {
                if (a[key] === b[key]) return 0;
                if (a[key] > b[key]) return -1;
                if (a[key] < b[key]) return 1;
            });
        }
        if (sortedLogs[0].id === logs[0].id) {
            sortedLogs.reverse();
        }
        setLogs(sortedLogs);
        setLoading(false);
    };

    return (
        <>
            <Layout>
                <Header>
                    <h3>使用明细（总消耗额度：
                        {showStat && renderQuota(stat.quota)}
                        {!showStat &&
                            <span onClick={handleEyeClick} style={{cursor: 'pointer', color: 'gray'}}>点击查看</span>}
                        ）
                    </h3>
                </Header>
                <Form layout='horizontal' style={{marginTop: 10}}>
                    <>
                        <Form.Input field="token_name" label='令牌名称' style={{width: 176}} value={token_name}
                                    placeholder={'可选值'} name='token_name'
                                    onChange={value => handleInputChange(value, 'token_name')}/>
                        <Form.Input field="model_name" label='模型名称' style={{width: 176}} value={model_name}
                                    placeholder='可选值'
                                    name='model_name'
                                    onChange={value => handleInputChange(value, 'model_name')}/>
                        <Form.DatePicker field="start_timestamp" label='起始时间' style={{width: 272}}
                                         initValue={start_timestamp}
                                         value={start_timestamp} type='dateTime'
                                         name='start_timestamp'
                                         onChange={value => handleInputChange(value, 'start_timestamp')}/>
                        <Form.DatePicker field="end_timestamp" fluid label='结束时间' style={{width: 272}}
                                         initValue={end_timestamp}
                                         value={end_timestamp} type='dateTime'
                                         name='end_timestamp'
                                         onChange={value => handleInputChange(value, 'end_timestamp')}/>
                        {/*<Form.Button fluid label='操作' width={2} onClick={refresh}>查询</Form.Button>*/}
                        {
                            isAdminUser && <>
                                <Form.Input field="channel" label='渠道 ID' style={{width: 176}} value={channel}
                                            placeholder='可选值' name='channel'
                                            onChange={value => handleInputChange(value, 'channel')}/>
                                <Form.Input field="username" label='用户名称' style={{width: 176}} value={username}
                                            placeholder={'可选值'} name='username'
                                            onChange={value => handleInputChange(value, 'username')}/>
                            </>
                        }
                        <Form.Section>
                            <Button label='查询' type="primary" htmlType="submit" className="btn-margin-right"
                                    onClick={refresh}>查询</Button>
                        </Form.Section>
                    </>
                </Form>
                <Table columns={columns} dataSource={pageData} pagination={{
                    currentPage: activePage,
                    pageSize: ITEMS_PER_PAGE,
                    total: logCount,
                    pageSizeOpts: [10, 20, 50, 100],
                    onPageChange: handlePageChange,
                }} loading={loading}/>
                <Select defaultValue="0" style={{width: 120}} onChange={
                    (value) => {
                        setLogType(parseInt(value));
                    }
                }>
                    <Select.Option value="0">全部</Select.Option>
                    <Select.Option value="1">充值</Select.Option>
                    <Select.Option value="2">消费</Select.Option>
                    <Select.Option value="3">管理</Select.Option>
                    <Select.Option value="4">系统</Select.Option>
                </Select>
            </Layout>
        </>
    );
};

export default LogsTable;

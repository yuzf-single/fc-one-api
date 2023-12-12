# Midjourney Proxy API文档


**简介**:Midjourney Proxy API文档


**HOST**:https://sell.fcpublic.com 


**Version**:v2.3.5


[TOC]






# 任务提交

## 提交Imagine任务


**接口地址**:`/mj/submit/imagine`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "base64": "",
  "notifyHook": "",
  "prompt": "Cat",
  "state": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|imagineDTO|imagineDTO|body|true|Imagine提交参数|Imagine提交参数|
|&emsp;&emsp;base64|垫图base64||false|string||
|&emsp;&emsp;notifyHook|回调地址, 为空时使用全局notifyHook||false|string||
|&emsp;&emsp;prompt|提示词||true|string||
|&emsp;&emsp;state|自定义参数||false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|提交结果|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码: 1(提交成功), 21(已存在), 22(排队中), other(错误)|integer(int32)|integer(int32)|
|description|描述|string||
|properties|扩展字段|object||
|result|任务ID|string||


**响应示例**:
```javascript
{
	"code": 1,
	"description": "提交成功",
	"properties": {},
	"result": 1320098173412546
}
```


# 任务查询

## 指定ID获取任务


**接口地址**:`/mj/task/{id}/fetch`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id|任务ID|path|false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|任务|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|action|可用值:IMAGINE,UPSCALE,VARIATION,REROLL,DESCRIBE,BLEND|string||
|description|任务描述|string||
|failReason|失败原因|string||
|finishTime|结束时间|integer(int64)|integer(int64)|
|id|任务ID|string||
|imageUrl|图片url|string||
|progress|任务进度|string||
|prompt|提示词|string||
|promptEn|提示词-英文|string||
|startTime|开始执行时间|integer(int64)|integer(int64)|
|state|自定义参数|string||
|status|任务状态,可用值:NOT_START,SUBMITTED,IN_PROGRESS,FAILURE,SUCCESS|string||
|submitTime|提交时间|integer(int64)|integer(int64)|


**响应示例**:
```javascript
{
	"action": "",
	"description": "",
	"failReason": "",
	"finishTime": 0,
	"id": "",
	"imageUrl": "",
	"progress": "",
	"prompt": "",
	"promptEn": "",
	"startTime": 0,
	"state": "",
	"status": "",
	"submitTime": 0
}
```

# 任务提交

## 根据回调地址的customId执行的变更操作


**接口地址**:`/mj/task/action`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称       | 参数说明                                | 请求类型   | 是否必须  | 数据类型   | schema |
|------------|-------------------------------------|--------|-------|--------| ------ |
| customId   | actionID(notifyHook填写自己的回调地址之后即可获取) | string | true  | string ||
| taskId     | 上一个任务id                             | string | true  | string ||
| notifyHook | 任务回调地址(可不填写)                        | string | false | string ||
| state      | 自定义参数(会展示在回调信息中)                    | string | false | string ||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|任务|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码: 1(提交成功), 21(已存在), 22(排队中), other(错误)|integer(int32)|integer(int32)|
|description|描述|string||
|properties|扩展字段|object||
|result|任务ID|string||


**响应示例**:
```javascript
{
    "code": 1,
        "description": "提交成功",
        "properties": {},
    "result": 1320098173412546
}
```


# 弹窗二次确认(蒙层)

## 弹窗二次确认(蒙层)


**接口地址**:`/mj/task/modal`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称       | 参数说明             | 请求类型   | 是否必须  | 数据类型   | schema |
|------------|------------------|--------|-------|--------| ------ |
| maskBase64 | 蒙层图片             | string | false | string ||
| taskId     | 上一个任务id          | string | true  | string ||
| prompt     | 提示词 action: customzoom 时需要加上 --zoom 1~2| string | false | string ||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|任务|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码: 1(提交成功), 21(已存在), 22(排队中), other(错误)|integer(int32)|integer(int32)|
|description|描述|string||
|properties|扩展字段|object||
|result|任务ID|string||


**响应示例**:
```javascript
{
    "code": 1,
        "description": "提交成功",
        "properties": {},
    "result": 1320098173412546
}
```
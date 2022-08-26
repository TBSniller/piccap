#!/bin/bash
luna-send -n 1 -f luna://com.webos.pmlogd/setdevlogstatus '{"recordDevLogs":true}'
luna-send -n 1 -f luna://com.webos.service.config/setConfigs '{"configs": {"system.collectDevLogs": true}}'
PmLogCtl set hyperion-webos debug
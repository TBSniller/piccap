#!/bin/bash
autostart=$(cat /var/luna/preferences/piccap_autostart)
if [[ "$autostart" == "1" ]]; then
    luna-send -a org.webosbrew.piccap -f -n 1 luna://com.webos.notification/createToast '{"sourceId":"org.webosbrew.piccap","message": "PicCap startup is enabled! Calling service for startup.."}'
    luna-send -n 1 -f luna://org.webosbrew.piccap.service/isStarted '{}'
fi
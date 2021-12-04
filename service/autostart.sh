#!/bin/sh

luna-send -a org.webosbrew.piccap -f -n 1 luna://com.webos.notification/createToast '{"sourceId":"org.webosbrew.piccap","message": "PicCap startup is enabled! Calling service for startup.."}'
luna-send -n 1 -f luna://org.webosbrew.piccap.service/start '{}'

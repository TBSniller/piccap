#!/bin/bash

hypersion_libvt=$(pidof hyperion-webos_libvt)
hyperion_libvtcapture=$(pidof hyperion-webos_libvtcapture)

if [[ "$hyperion_libvtcapture" != "" ]]; then
    echo "yes"
    exit 0
fi

if [[ "$hyperion_libvt" != "" ]]; then
    echo "yes"
    exit 0
fi

echo "no"
exit 0
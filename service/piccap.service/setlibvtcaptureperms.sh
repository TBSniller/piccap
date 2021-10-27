#!/bin/bash

# Directory to store overlays in (one directory structure is created per overlay configured down below)
# https://gist.github.com/Informatic/db387d512bf4ae5512d9f644c4d219d2
OVERLAY_BASE=/home/root/overlays
overlay() {
        set -e
        overlay_id="$(echo $1 | sed 's;/;__;g')"
        unset TARGET SOURCE FSTYPE OPTIONS
        eval $(findmnt -P $1)
        if [[ "$FSTYPE" == "overlay" ]]; then
                echo "[-] Overlay '$1' already mounted"
        else
                echo "[ ] Preparing overlay for '$1' -> $OVERLAY_BASE/$overlay_id"
                mkdir -p "$OVERLAY_BASE/$overlay_id/upper" "$OVERLAY_BASE/$overlay_id/work"
                mount -t overlay -o lowerdir=$1,upperdir=$OVERLAY_BASE/$overlay_id/upper/,workdir=$OVERLAY_BASE/$overlay_id/work/ overlay-$overlay_id $1
                echo "[+] Overlay '$1' mounted"
        fi
}

overlay /usr/share/luna-service2/manifests.d
overlay /usr/share/luna-service2/roles.d

cp -f /media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/screen-capture-webos.manifest.json /usr/share/luna-service2/manifests.d/screen-capture-webos.manifest.json
cp -f /media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/org.webosbrew.piccap.service.role.json /usr/share/luna-service2/roles.d/org.webosbrew.piccap.service.role.json

ls-control scan-services
# PicCap - Hyperion Sender App | Ambilight for LG WebOS TVs

### Hyperion?
Hyperion is basicly a server service which is running on for example a Raspberry Pi connecting to LED stripes to get an ambilight like Philipps TVs have. The main page of this project: https://github.com/hyperion-project/hyperion.ng Here is a simple HowTo-Build tutorial: https://github.com/TBSniller/piccap/blob/main/DIY_Ambilight.md

### What is this? 
The main idea of this is, to have a simple frontend app with autostart feature for the hyperion-webos executable firstly developed by mariotaku here: https://github.com/webosbrew/hyperion-webos and also ported to newer TVs here: https://github.com/TBSniller/hyperion-webos  

I'm not a real programmer and all this stuff is really new to me. The only reason this exists, is because I just badly wanted it for any cost. Feel free to create an issue or pull request if you can make things better.  
**This app is still in very early development.**  

I think a picture describes what's going on:
![image](https://user-images.githubusercontent.com/51515147/139295840-fd57d90d-8583-45e5-9284-04cedae2647e.png)

### Not working
Limiting FPS isn't working.  
Libvt (old version) may not running on all TVs, if you get the status `capture running: true`, but Hyperion seems to be black, its an issue with the hyperion-webos_libvt binary and not this application.  

### What do you need?
At this time root is neccessary. You will also have the Homebrew Channel installed: https://github.com/webosbrew/webos-homebrew-channel  
You should also know what you are doing and should have basic knowledge about all this root stuff, because you can brick your TV and I wouldn't take any responsibilty if you did so. Mainly this isn't the case, but you have been warned.  

### Before first appstart
You have to edit the permission file for the Homebrew Channel, to make it's service available to others:  

Connect to your TV with SSH.  
Open /var/luna-service2-dev/api-permissions.d/org.webosbrew.hbchannel.service.api.json with   

> vi /var/luna-service2-dev/api-permissions.d/org.webosbrew.hbchannel.service.api.json  

Press 'a' to get into editmode and change **org.webosbrew.hbchannel.service.group** to **public**, so you have the following text in this file:   

> { "public": [ "org.webosbrew.hbchannel.service/\*" ], "ares.webos.cli": [ "org.webosbrew.hbchannel.service/\*" ] }  

Press 'ESC' to exit editmode, save with typing **:wq!** and pressing 'Enter'. Simply reboot your TV after that.  
___
You can also run this command:  
`sed -i 's/org.webosbrew.hbchannel.service.group/public/g' /var/luna-service2-dev/api-permissions.d/org.webosbrew.hbchannel.service.api.json; reboot`  
And check after reboot:  
`cat /var/luna-service2-dev/api-permissions.d/org.webosbrew.hbchannel.service.api.json`  

### After first start 
Wait a few secounds to let the service elevate root permissions through the Homebrew Channel-Service. After that do a full reboot (no powercycle) of your TV using SSH and typing the reboot command, or removing the power source for a few secounds. The app will tell you when it's ready to get rebooted.  

### Old TV, new TV?
Actually we reversed four different librarys which are used by LG TVs to capture the screen. That's why this app covers two different ways of handling these librarys.  

For older TVs (~2020 and before) it is libvt for capturing video and libgm for capturing the UI.  

On newer TVs (~2020 and after) it is libvtcapture for capturing video and libhalgal for capturing the UI.  
For using libvtcapture LG started to do some permission handling, so we need to do this also for our custom executeable. Just see `piccap.service/setlibvtcaptureperms.sh` to get an idea.   

You can also find some information about these librarys here: https://github.com/webosbrew/tv-native-apis  

### How to use
Simply fill in your parameters and press save. The configuration files will then be saved to `/var/luna/preferences/` and reloaded to the application.  
Simply press start after the application ended loading (~30 secounds after start).   
 
### How to install
Download the ipk from releases or build it all yourself.  

Then using ares:  
`cmd.exe /c E:\webOS_TV_SDK\CLI\bin\ares-install.cmd -d YOURTV E:\Downloads\org.webosbrew.piccap_0.0.8_all.ipk`  

Or manually:  
Copy to TV:  
`scp /home/USER/downloads/org.webosbrew.piccap_0.0.8_all.ipk root@TVIP:/tmp/org.webosbrew.piccap_0.0.8_all.ipk`  
or download:  
`wget -P /tmp https://github.com/TBSniller/piccap/releases/download/testing/org.webosbrew.piccap_0.0.8_all.ipk` 
  
And installing on TV using:   
` luna-send -i -f luna://com.webos.appInstallService/dev/install '{"id":"org.webosbrew.p
iccap","ipkUrl":"/tmp/org.webosbrew.piccap_0.0.8_all.ipk","subscribe":true}'`  



### How to build
Put both compiled versions of hyperion-webos versions in service folder.  
libvt (https://github.com/webosbrew/hyperion-webos): `service/piccap.service/hyperion-webos_libvt`  
libvtcapture (https://github.com/TBSniller/hyperion-webos): `service/piccap.service/hyperion-webos_libvtcapture`  
`mkdir build`  
`cd service`  
`npm install`  
`npm run build`  
`cd ..`  
`ares-package ./piccap ./service/piccap.service -o build`  


# Credits
As stated in the application:  

Love to Mariotaku https://github.com/mariotaku  
Love to JohnPaul https://github.com/Informatic  
Love to OpenLG-Discord https://discord.gg/9sqAgHVRhP  
All this wouldn't be possible without them!

Obvously WebOS SDK from LG https://webostv.developer.lge.com/sdk/installation/download-installer/
Application design easily created with https://nicepage.com/html-website-builder

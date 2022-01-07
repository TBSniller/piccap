
# PicCap - Hyperion Sender App | Ambilight for LG WebOS TVs  
  
### Hyperion?  
Hyperion basicly is a server service which is running on for example a Raspberry Pi connecting to LED stripes to get an ambilight, as like Philipps TVs have. The main page of this project: https://github.com/hyperion-project/hyperion.ng Here is a simple HowTo-DIY-Build tutorial: https://github.com/TBSniller/piccap/blob/main/DIY_Ambilight.md
  
  
### What is this?  
The main idea of this is, to have a simple frontend app with autostart feature for the hyperion-webos executable firstly developed by mariotaku here: https://github.com/webosbrew/hyperion-webos. This executeable now is a real native WebOS-service through what we get some benefits like higher performance.  
PicCap directly speaks to this service, so its reasonable for starting, stopping, displaying and changing settings of this service.  
  
  
I'm not a real programmer and all this stuff is really new to me. The only reason this exists, is because I just wanted to have it for any cost. Feel free to create an issue or pull request if you can make things better.  
  
**This app is still in very early development.**
  
I think a picture describes what's going on:  
![image](https://user-images.githubusercontent.com/51515147/148600390-a1eafb20-240a-4d8e-b71f-e03729950599.png)

  

### Not working  
Autostart only works after a complete TV-restart. If your TV goes to suspension after shutting it down, our startup scripts doesn't get fired when the TV gets waked up again. To work around it, you will have to disable LGs Quick Start+ in settings until we find a reliable way. This way the TV doesn't go to sleep, it fully shuts down.  
Nothing more known so far.  
Please see https://github.com/webosbrew/hyperion-webos/tree/main#known-issues for issues regarding the backend capture service. - This is only the frontend application!  

### What do you need?  

At this time root is neccessary. You will also need to have the latest Homebrew Channel installed: https://github.com/webosbrew/webos-homebrew-channel

You should also know what you are doing and should have basic knowledge about all this root stuff, because you can brick your TV and I wouldn't take any responsibilty if you did so. Mainly this isn't the case, but you have been warned. 
  
### After first start  
Wait a few secounds to let the service elevate root permissions through the Homebrew Channel-Service. After that a full reboot (no powercycle) of your TV might be neccessary. You can simply use the reboot button.
  
  
### Old TV, new TV?  
Actually we reversed four different librarys which are used by LG TVs to capture the screen. That's why this app covers different ways of handling these librarys.  
You can take a look at here to get an idea: https://github.com/webosbrew/hyperion-webos/tree/main#backends

### How to use  
Simply fill in your parameters and press save. The configuration file will then be saved to the service directory and reloaded to the application.
  
Simply press start after the application ended loading.
  
### How to install  
Easy way:  
Easily install it from HBChannel https://github.com/webosbrew/webos-homebrew-channel. It's published at the repo: https://repo.webosbrew.org/apps/  

You can also download the ipk from releases or build it all yourself.
  
After that install it using ares:
`cmd.exe /c E:\webOS_TV_SDK\CLI\bin\ares-install.cmd -d YOURTV E:\Downloads\org.webosbrew.piccap_0.2.0_all.ipk`
  
Or install it manually:  
  
Copy to TV:  
`scp /home/USER/downloads/org.webosbrew.piccap_0.2.0_all.ipk root@TVIP:/tmp/org.webosbrew.piccap_0.2.0_all.ipk`

or download:  
`wget -P /tmp https://github.com/TBSniller/piccap/releases/download/testing/org.webosbrew.piccap_0.2.0_all.ipk`
And installing on TV using:  
`luna-send -i -f luna://com.webos.appInstallService/dev/install '{"id":"org.webosbrew.p
iccap","ipkUrl":"/tmp/org.webosbrew.piccap_0.2.0_all.ipk","subscribe":true}'`  
  

### How to build  
Put compiled versions of hyperion-webos and needed libraries in nativeservice folder.  
Then:  
`mkdir build`  
`npm install`
`npm run-script build`
`npm run-script package-native`
  
# Credits  
As stated in the application:  
Love to Mariotaku https://github.com/mariotaku  
Love to JohnPaul https://github.com/Informatic  
Love to tuxuser https://github.com/tuxuser
Love to OpenLG-Discord https://discord.gg/9sqAgHVRhP  
All this wouldn't be possible without them!  
  
Obvously WebOS SDK from LG https://webostv.developer.lge.com/sdk/installation/download-installer/  
Application design easily created with https://nicepage.com/html-website-builder  

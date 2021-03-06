## Requirements (Maybe differs for your country)

- Raspberrry Pi 3 or 4 + Stuff (MicroSD, Power, maybe a Case,..)
- 5V 8A Power Source (I am using this: https://www.amazon.de/borui-uk-Netzteil-MeanWell-LPV-60-5-Schaltnetzteil/dp/B017U7JGGY)
- Old Powercord
- WS2801 LED Stripes (I am using this: https://www.amazon.de/gp/product/B072B6561S/ You can get them cheaper on AliExpress + Measure up your TV for real cm needed)
- Jumping Wires (Like: https://www.amazon.de/gp/product/B00OK74ABO)
- Few Wagos (Like: https://www.amazon.de/Wago-Verbindungsklemme-221-413-50-St%C3%BCck/dp/B00JB3U9CG)
- Soldering iron and solder
- Datacable (I recommend these, if you have a long way from TV to Pi, because they are shieded: https://www.amazon.de/Busleitung-Datenleitung-Datenkabel-Installationsbusleitung-Telekommunikationskabel/dp/B071W5TQPY/ otherwise use the next one cables)
- Power cables (LED | Like: https://www.amazon.de/WITTKOWARE-Sortiment-Schaltdr%C3%A4hte-5mm-10m/dp/B075V79HGF/)


## Hardware

## TV preparing

1. Measure up each side of your TV and cut the stripe at the edges.
2. There are arrows under the sticky tape. Make sure all of them are looking in the same direction: -> -> not -><-. Data and clock cannot flow if they do not go in one direction.
<img src="https://user-images.githubusercontent.com/51515147/118692431-5b8bbb80-b80a-11eb-9ab2-ab001b5cee96.jpg" width="300" height="200" />
3. Tape them on your TV. You have two options. Begin your input stripe in one of the corners, or let it begin anywhere. You can set it later in the settings of hyperion.
<img src="https://user-images.githubusercontent.com/51515147/118692535-79592080-b80a-11eb-926d-e5fd76c859a3.jpg" width="400" height="500" />
4. Use your soldering iron and powercables to connect the corners. You also have to connect (!!ONLY!!) GND and V+ with the end and the beginning of your stripe, to prevent powerloss over a long ledstripe.
You can also use some edge connectors (like: https://www.amazon.de/dp/B08C2M18XF), but in this case they are a way to small and you have to cut them a bit (Trust me you would not do this.. took me 4 hours to get this sh\*\* working).
<img src="https://user-images.githubusercontent.com/51515147/118692379-43b43780-b80a-11eb-8dfc-9937718eb3eb.jpg" width="400" height="500" />
5. Get your datacable or another powercables ready. Connect them to CLK(CK) and SI(DI) on your input stripe. They have to be as long, as your way to your Pi is. After that you can use the jumpercables to solder one end with the ledstripe cable and use the other end as GPIO connector. I got flickering issues (caused by the powernet) so I decided to wiggle the data cables with aluminum foil. Flickering disappeard. You can avoid this if you buy the datacable right at first. 
<img src="https://user-images.githubusercontent.com/51515147/118692578-8413b580-b80a-11eb-8613-8e5b7019bec2.jpg" width="400" height="500" />

#### Power source preparing

--MAKE SURE YOU KNOW WHAT YOU ARE DOING! IF NOT ASK AN ELECTRICAN! THIS EXAMPLE IS FOR GERMANY!! --

1. Get your power source, the Wagos, a cutted old powercode and connect it together:
<img src="https://user-images.githubusercontent.com/51515147/118692940-de147b00-b80a-11eb-9a4c-546f48545994.jpg" width="200" height="200" />

2. Get your power source, the Wagos, the powercables and connect them together:
<img src="https://user-images.githubusercontent.com/51515147/118692957-e371c580-b80a-11eb-9a01-862b02246ae0.jpg" width="200" height="200" />

#### Led+Pi connection
1. Connect GND(Black) and V+(Red) with your LED-Stripe
2. Connect GND(Black) also with a GND Pin of the Pi (eg. Pin 9 | **Pi 3/4**) You can find a plan here: https://www.elektronik-kompendium.de/sites/raspberry-pi/fotos/raspberry-pi-15b.jpg (Pi 3 and 4 are the same. **Pi 2 is different!**)
3. Connect CLK(CK) of your input stripe with Pin 23
4. Connect SI(DI) of your input stripe with Pin 19
Here is a very nice picture, how to look after all: https://digitalewelt.at/wp-content/uploads/2018/02/Ambilight-Projekt-Verkabelung-LED-Netzteil.jpg

## Software
- Add **dtparam=spi=on** to the end of your /boot/config.txt and reboot
- Installation and usage guide: https://docs.hyperion-project.org/en/user/Installation.html#requirements
- After installation you have to setup the WS2801s. Therefore in Hyperion go to Configuration -> Led-Hardware -> Controller type: **WS2801**, SPI path: **/dev/spidev0.0**, , Baudrate: **1000000**. Change RGB byte order if you experience wrong colors. Mine are on **RGB**
- Count your LEDs and pass them to the LED-Layout tab. 

## Credits
Build it myself using this guide: https://digitalewelt.at/ambilight-mit-dem-raspberry-pi-3-4k-schritt-fuer-schritt-anleitung/

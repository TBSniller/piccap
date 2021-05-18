## Requirements

- Raspberrry Pi 3 or 4 + Stuff (MicroSD, Power, maybe a Case,..)
- 5V 8A Power Source (I am using this: https://www.amazon.de/borui-uk-Netzteil-MeanWell-LPV-60-5-Schaltnetzteil/dp/B017U7JGGY)
- Old Powercord
- WS2801 LED Stripes (I am using this: https://www.amazon.de/gp/product/B072B6561S/ You can get them cheaper on AliExpress + Measure up your TV for real cm needed)
- Jumping Wires (Like: https://www.amazon.de/gp/product/B00OK74ABO)
- Few Wagos (Like: https://www.amazon.de/Wago-Verbindungsklemme-221-413-50-St%C3%BCck/dp/B00JB3U9CG)
- Soldering iron and solder
- Datacable (I recommend these, if you have a long way from TV to Pi, because they are shieded: https://www.amazon.de/Busleitung-Datenleitung-Datenkabel-Installationsbusleitung-Telekommunikationskabel/dp/B071W5TQPY/ otherwise use the next one cables)
- Power cables (LED | Like: https://www.amazon.de/WITTKOWARE-Sortiment-Schaltdr%C3%A4hte-5mm-10m/dp/B075V79HGF/)

##Hardware

####TV preparing
1. Measure up each side of your TV and cut the stripe at the edges.
2. There are arrows under the sticky tape. Make sure all of them are looking in the same direction: -> -> not -><-. Data and clock cannot flow if they do not go in one direction.
3. Tape them on your TV. You have two options. Begin your input stripe in one of the corners, or let it begin anywhere. You can set it later in the settings of hyperion.
4. Use your soldering iron and powercables to connect the corners. You also have to connect (!!ONLY!!) GND and V+ with the and and the beginning of your stripe, to prevent powerloss over a long ledstripe

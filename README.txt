ini semua page address untuk kode gua
Page	Address
Home (orders page)	http://localhost:3000/
Store, TechZone Official (default)	http://localhost:3000/storeinfo
Payment	http://localhost:3000/checkout

Other stores

Store	Address
Gadget Mart	http://localhost:3000/storeinfo?store=gadget-mart
Kreasi Case ID	http://localhost:3000/storeinfo?store=kreasi-case-id
TechZone Official	http://localhost:3000/storeinfo?store=techzone-official

Item pages

Product	Address
Earphone Bluetooth TWS	http://localhost:3000/itemdescription/earphone-bluetooth-tws
Kabel USB-C 1m	http://localhost:3000/itemdescription/kabel-usb-c-1m
Power Bank 10000mAh	http://localhost:3000/itemdescription/power-bank-10000mah
Mouse Wireless Slim	http://localhost:3000/itemdescription/mouse-wireless-slim
Keyboard Mekanik	http://localhost:3000/itemdescription/keyboard-mekanik
Casing HP Anti Crack	http://localhost:3000/itemdescription/casing-hp-anti-crack

A few notes for your team:

localhost:3000 only works on the machine running the app. Teammates need to run the project themselves, or you need to deploy it (for example to Vercel) to get a shared address.
/checkout opened directly shows a demo item. To see a real order in it, click Buy Now on an item page.
The store address also accepts a search term: /storeinfo?store=gadget-mart&q=mouse opens the shop with "mouse" already searched.
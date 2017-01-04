## Screen to Screen Controller

This app replicates a game of pong for 1-player (against a computer) and 2-player.  
The player paddle(s) are controlled via accellerometer, and operate over a socket. 

### Starting the server

    sh run.sh

    [OR]

    virtualenv venv
    . venv/bin/activate
    python app.py


### Playing the game (single player)

- using a computer, go to http://localhost:8888/
- find this computer's local IP address ( typically under network settings )
- connect to [your-ip-address]:8888/ with the phone
- alternately, update the QR code with the correct IP address for ease-of-use


### Playing the game (two player)

- using a computer, go to http://localhost:8888/2-player-host
- find this computer's local IP address ( typically under network settings )
- PLAYER 1 : use your phone to connect to [your-ip-address]:8888/player-1
- PLAYER 2 : use your phone to connect to [your-ip-address]:8888/player-2
- alternately, update the QR codes with the correct IP address for ease-of-use


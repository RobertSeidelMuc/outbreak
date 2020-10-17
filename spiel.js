/* CONSTRUCTORS */
//* Sound constructor *//
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = `sounds/${src}.wav`;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
} 

/* Sound constants */
const collideSound = new sound("collide");
const crashSound = new sound("crash");
const levelCompleteSound = new sound('complete');
const cSound = new sound('c');
const dSound = new sound('d');
const eSound = new sound('e');

/* GLOBALE OBJEKTE, VARIABLEN UND KONSTANTEN */
/* Canvas variables */
var canvasHeight;   //all of these will be initialized in the setup() function;
var canvasWidth;
var innerPadding;

//Spielfed-Obkect
var spielfeld = {
    breite: 0,
    hoehe: 0,
    strokeGewicht: 2,

    create: function() {
        stroke('white');
        strokeWeight(this.strokeGewicht);
        line(0, 0, 0, this.hoehe);
        line(0, 0, this.breite, 0);
        stroke('#990033');
        line(0, this.hoehe, this.breite, this.hoehe);
    }
}

var plattform = {
    breite: 0,
    hoehe: 0,
    strokeGewicht: 2,
    eckRadius: 0,
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    geschw: 0,
    zerstoerbar: false,
    sound: collideSound,

    //functions
    moveLeft: function() {
        //make sure the platform does not move beyond the left side of screen
        if (this.posX - this.strokeGewicht > 0) {
            this.posX -= this.geschw * deltaTime / 100;
        }
    },
    moveRight: function() {
        //make sure the platform does not move beyond the right side of screen
        if (this.posX + this.breite + this.strokeGewicht < spielfeld.breite) {
            this.posX += this.geschw * deltaTime / 100;
        }
    }
};

//treated ball as object
var ball = {
    //variables
    gestartet: false, //wird true, wenn Ball sich bewegen soll
    durchmesser: 0,
    startPosX: 0,
    startPosY: 0,
    posX: 0, //die aktuelle x-Position des Balls
    posY: 0, //die aktuelle y-Position des Balls
    letztesX: -100, //die x-Position beim vorherigen Frame
    letztesY: -100, //die y-Position beim vorherigen Frame
    geschwX: 0.0, // die Geschwindigkeit des Balls
    geschwY: 0.0,
    maxGeschw: 0,
    startRot: 0,
    startGruen: 204, //color of ball -- start with a darkish green (= no movement)
    startBlau: 0,
    maxRot: 255, //maximum red value ball
    rot: this.startRot,
    gruen: this.startGruen,
    blau: this.startBlau,

    //functions
    changeColor: function() {
        //changes the ball's color depening on its speed
        //low speed = green
        //medium speed = yellowish orange
        //high speed = red
        //rgb value for max speed should be (255, 0, 0)
    
        //calculate a single value from both speed values
        this.blau = 0;
    
        //red value should reach its maximum at half the maximum points,
        //in order to create an orange color (in combination with the green value)
        let neuerRotWert = Math.trunc(this.maxRot * interface.punkte / (interface.maxPunkte/2));
        if (neuerRotWert > 255) {
            neuerRotWert = 255;
        }
        this.rot = neuerRotWert;
    
        //green value should only decrease once half the maximum points are reached, 
        //in order to create an orange color (in combination with the red value)
        let neuerGruenWert = Math.trunc(this.startGruen * (interface.maxPunkte - interface.punkte) / (interface.maxPunkte/2));
        if (interface.punkte > interface.maxPunkte/2) {
            this.gruen = neuerGruenWert;
        }
        else neuerGruenWert = 204;
    },
    
    drawObject: function() {
        // Ball zeichnen
        this.changeColor();
        fill(this.rot, this.gruen, this.blau);            //task 1: changed color of ball
        noStroke();
        circle(this.posX, this.posY, this.durchmesser);
    },

    applySpeedLimit: function() {
        if (this.geschwX > this.maxGeschw) {
            this.geschwX = this.maxGeschw;
        }
        else if (this.geschwX < this.maxGeschw * -1) {
            this.geschwX = this.maxGeschw * -1;
        }
        
        if (this.geschwY > this.maxGeschw) {
            this.geschwY = this.maxGeschw;
        }
        else if (this.geschwY < this.maxGeschw * -1) {
            this.geschwY = this.maxGeschw * -1;
        }    
    }
};

var interface = {
    pausiert: false,
    level: 0,
    maxLevel: 2,
    leben: 3,
    punkte: 0,
    maxPunkte: 338, //nur ein Gimmick, um den Ball im Verlauf des Spiels langsam einzufärben
    highScore: localStorage.getItem('highScore') || 0, 
    // hole den Highscore aus dem Browser-Cache 
    // oder lege einen entsprechenden Eintrag an,
    // wenn noch keiner vorhanden ist
    grosseSchrift: 0,
    kleineSchrift: 0,
    levelComplete: false,

    // Funktionen
    zeichneHUD: function() {
        fill('white');
        noStroke();
        textSize(this.grosseSchrift);
        textAlign(RIGHT, TOP);
        text(`High score:\n${interface.highScore}\n\nScore:\n${interface.punkte}\n\nLevel:\n${this.level <= 1 ? 1 : this.level}`, Math.trunc(canvasWidth - innerPadding), Math.trunc(0 + innerPadding));
    },

    startbildschirm: function() {
        fill('white');
        noStroke();
        textSize(this.grosseSchrift);
        textAlign(CENTER, CENTER);
        text('Press ENTER to play', spielfeld.breite/2, spielfeld.hoehe/2); 
        this.tutorial();
    },

    pausenBildschirm: function() {
        fill ('black');
    },

    gameOverBildschirm: function() {
        fill('white');
        noStroke();
        textSize(this.grosseSchrift);
        textAlign(CENTER, CENTER);
        text('GAME OVER\nPlay Again?', spielfeld.breite/2, spielfeld.hoehe/2); 
        this.tutorial();
    },

    levelCompleteBildschirm: function() {
        fill('white');
        noStroke();
        textSize(this.grosseSchrift);
        textAlign(CENTER, CENTER);
        text(`Level ${interface.level} complete!\nContinue with next level?`, spielfeld.breite/2, spielfeld.hoehe/2); 
    },

    gameCompleteBildschirm: function() {
        fill('white');
        noStroke();
        textSize(this.grosseSchrift);
        textAlign(CENTER, CENTER);
        text(`CONGRATULATIONS!\nYou beat the game!\nPlay again?`, spielfeld.breite/2, spielfeld.hoehe/2); 
    },

    tutorial: function() {
        textSize(this.kleineSchrift);
        textAlign(RIGHT, TOP);
        text('← left arrow', plattform.posX - plattform.breite/7, plattform.posY);

        textAlign(LEFT, TOP)
        text('right arrow →', plattform.posX + plattform.breite + plattform.breite/7, plattform.posY);
    },

    // Übernommen von: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
    herz: {
        size: 0,
        fuellwert: 'darkred',
        strokewert: 'red', 

        // Funktionen
        draw: function (x, y) {
            fill(this.fuellwert);
            stroke(this.strokewert);
            strokeWeight(2);
            beginShape();
            vertex(x, y);
            bezierVertex(x - this.size / 2, y - this.size / 2, x - this.size, y + this.size / 3, x, y + this.size);
            bezierVertex(x + this.size, y + this.size / 3, x + this.size / 2, y - this.size / 2, x, y);
            endShape(CLOSE);
        },

        update: function() {
            this.fuellwert = 'black';
            this.strokewert = '#990033';
            if (interface.leben > 2) {
                this.fuellwert = '#ff5050';
                this.strokewert = '#ff5050';
            }    
            this.draw(spielfeld.breite + Math.trunc((canvasWidth - spielfeld.breite)/3*2 + 4), Math.trunc(canvasHeight - innerPadding * 3));
            if (interface.leben > 1) {
                this.fuellwert = '#ff5050';
                this.strokewert = '#ff5050';
            }
            this.draw(spielfeld.breite + Math.trunc((canvasWidth - spielfeld.breite)/2), Math.trunc(canvasHeight - innerPadding * 3));
            if (interface.leben > 0) {
                this.fuellwert = '#ff5050';
                this.strokewert = '#ff5050';
            }    
            this.draw(spielfeld.breite + Math.trunc((canvasWidth - spielfeld.breite)/3 - 4), Math.trunc(canvasHeight - innerPadding * 3));
        }
    }
};

//Steine geben Punkte
var raster = {
    plaetzeGesamt: [],
    anzahlPlaetzeX: 0,
    anzahlPlaetzeY: 0,
    posX: 0,
    posY: 0,
    stein: [],
    steinzahl: 0,

    erzeuge: function() {
        let index = 0;
        for (let y = 0; y < this.anzahlPlaetzeY; y++) {  // gehe jede einzelne Zeile durch
            for (let x = 0; x < this.anzahlPlaetzeX; x++)     {  // gehe jede einzelne Spalte durch
                
                this.stein[index] = new raster.Stein(x, y, index);
                index++;
            }                             
        }
    },

    //nutze Stein als Constructor
    Stein: function(x, y, index){
        this.index = index;
        this.platziert = true;
        this.breite = spielfeld.breite/(raster.anzahlPlaetzeX);
        this.hoehe = plattform.hoehe;
        this.posX = (x)*this.breite;
        this.posY = (y)*this.hoehe;
        this.farbe = 'yellow';
        this.strokeGewicht = 2;
        this.strokeFarbe = 'orange';
        this.punkte = 0;
        this.zerstoerbar = true;
        this.sound = cSound;
        this.zeichne = function() {
            fill(this.farbe);
            stroke(this.strokeFarbe);
            strokeWeight(this.strokeGewicht);
            rect(this.posX, this.posY, this.breite, this.hoehe);
        }
    }
}

var levelErstellen = function(level) {
    //setze alle Steine zurück
    for (let i in raster.stein) {
        raster.stein[i].platziert = false;
    }
    raster.steinzahl = 0;

    //Testlevel, um schnell das Ende von Level 1 zu sehen
    /*if (level == 1) {
        raster.stein[277].platziert = true;
        raster.steinzahl++;

        raster.stein[277].farbe = '#00cc66';
        raster.stein[277].strokeFarbe = '#00331a';
        raster.stein[277].punkte = 1;
        raster.stein[277].sound = cSound;
    }*/

    //zeichen Muster für Level 1
    if (level == 1) {
        //gewünschte Steine aktivieren
        for (let i = 71; i <= 82; i++) { 
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#009999';
            raster.stein[i].strokeFarbe = '#003333';
            raster.stein[i].punkte = 3;
            raster.stein[i].sound = eSound;
        }
        for (let i = 85; i <= 96; i++) { 
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#009999';
            raster.stein[i].strokeFarbe = '#003333';
            raster.stein[i].punkte = 3;
            raster.stein[i].sound = eSound;
        }
        
        for (let i = 99; i <= 110; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#00cc99';
            raster.stein[i].strokeFarbe = '#003326';
            raster.stein[i].punkte = 2;
            raster.stein[i].sound = dSound;
        } 
        for (let i = 113; i <= 124; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#00cc99';
            raster.stein[i].strokeFarbe = '#003326';
            raster.stein[i].punkte = 2;
            raster.stein[i].sound = dSound;
        } 

        for (let i = 127; i <= 138; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#00cc66';
            raster.stein[i].strokeFarbe = '#00331a';
            raster.stein[i].punkte = 1;
            raster.stein[i].sound = cSound;
        }   
        for (let i = 141; i <= 152; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#00cc66';
            raster.stein[i].strokeFarbe = '#00331a';
            raster.stein[i].punkte = 1;
            raster.stein[i].sound = cSound;
        }     
        for (let i = 155; i <= 166; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#00cc66';
            raster.stein[i].strokeFarbe = '#00331a';
            raster.stein[i].punkte = 1;
            raster.stein[i].sound = cSound;
        }                     
    }
    else if (level == 2) {
        //gewünschte Steine aktivieren
        for (let i = 28; i <= 55; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#ff9999';
            raster.stein[i].strokeFarbe = '#330000';
            raster.stein[i].punkte = 3;
            raster.stein[i].sound = eSound;
        }
        for (let i = 84; i <= 111; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;

            raster.stein[i].farbe = '#ffcc99';
            raster.stein[i].strokeFarbe = '#331a00';
            raster.stein[i].punkte = 2;
            raster.stein[i].sound = dSound;
        }
        for (let i = 140; i <= 181; i++) {
            raster.stein[i].platziert = true;
            raster.steinzahl++;
            raster.stein[i].farbe = '#ffff99';
            raster.stein[i].strokeFarbe = '#333300';
            raster.stein[i].punkte = 1;
            raster.stein[i].sound = cSound;
        }          
    }
}


/* FUNKTIONEN */
function setup() {
    canvasHeight = Math.trunc(windowHeight * 0.8); //let the canvas be 80 % of the inner window's height.
    canvasWidth = Math.trunc(canvasHeight / 3 * 4); //give the canvas a ratio of 4:3, similar to old TVs
    innerPadding = Math.trunc(canvasHeight * 0.03); //the minimum distance that UI elements should have from the canvas's edge
    createCanvas(canvasWidth, canvasHeight);

    //create a square playing field
    spielfeld.hoehe = canvasHeight;
    spielfeld.breite = canvasHeight;

    interface.grosseSchrift = Math.trunc(spielfeld.hoehe/30);
    interface.kleineSchrift = Math.trunc(spielfeld.hoehe/40);
    interface.herz.size = Math.trunc(spielfeld.breite * 0.04);

    //initialize platform variables
    plattform.breite = Math.trunc(spielfeld.breite * 0.175);
    plattform.hoehe = Math.trunc(spielfeld.hoehe * 0.03);
    plattform.eckRadius = 0; //Math.trunc(plattform.hoehe / 2);
    plattform.startX = Math.trunc(spielfeld.breite / 2 - plattform.breite / 2);   // place platform at center of field
    plattform.startY = Math.trunc(spielfeld.hoehe - innerPadding * 1.5 - plattform.hoehe);
    plattform.posX = plattform.startX; //these denote the platform's top left corner
    plattform.posY = plattform.startY; //these denote the platform's top left corner
    plattform.geschw = canvasHeight * 0.1; 

    //initialize ball variables
    ball.durchmesser = Math.trunc(canvasHeight * 0.03);
    ball.maxGeschw = Math.trunc(canvasHeight / 3);
    ball.startPosX = Math.trunc(plattform.posX + plattform.breite/2); //zentriere den Ball
    ball.startPosY = plattform.posY - ball.durchmesser * 2;

    raster.anzahlPlaetzeX = 14;
    raster.anzahlPlaetzeY = 20;

    //erzeugt das Raster aus Steinen 
    raster.erzeuge();

    //moved original code into a separate function in order to make it reusable for tasks 8 and 9: reset ball
    resetGame();
}

function keyPressed() {
    //start game
    if (keyCode == ENTER) {
        if (ball.gestartet === false) {
            plattform.posX = plattform.startX;
            plattform.posY = plattform.startY;

            // Setze den Ball zurück zum Startpunkt
            ball.posX = ball.startPosX;
            ball.posY = ball.startPosY;

            // reset ball color
            ball.rot = ball.startRot;
            ball.gruen = ball.startGruen;

            if (interface.pausiert === false) {
                //starte das Spiel
                ball.gestartet = true;
                
                if (interface.level == 0) {
                    interface.level++;
                    levelErstellen(interface.level);
                }
                else if (interface.level == -1) {
                    interface.level = 1;
                    levelErstellen(interface.level);
                    interface.leben = 3;
                    interface.punkte = 0;
                }
                else if (interface.level >= 1 && interface.level < interface.maxLevel && interface.levelComplete == true) {
                    interface.level++;
                    levelErstellen(interface.level);
                    interface.levelComplete = false;
                }
                else if (interface.level == interface.maxLevel && interface.levelComplete == true) {
                    interface.level = 1;
                    levelErstellen(interface.level);
                    interface.levelComplete == false;
                    interface.leben = 3;
                    interface.punkte = 0;                
                }
            }


            ball.geschwX = Math.trunc(spielfeld.hoehe * 0.05) * (1+(interface.level-1)*0.2); 
            ball.geschwY = Math.trunc(spielfeld.hoehe * 0.05) * (1+(interface.level-1)*0.2);
        }
    }

    if (key == 'P' || key == 'p' || keyCode == ESCAPE) {
        if (ball.gestartet === true && interface.pausiert === false) {
            ball.gestartet = false;
            interface.pausiert = true;
        }
    }
}

function draw() {
    if (keyIsPressed && keyCode == LEFT_ARROW) plattform.moveLeft();
    if (keyIsPressed && keyCode == RIGHT_ARROW) plattform.moveRight();

    // 1. Zustand der Welt verändert sich
    if (ball.gestartet) {
        // Teste, ob der Ball mit der Plattform kollidiert
        outerCollisionCheck(ball, ball.posX, ball.posY, plattform);

        // Teste, ob der Ball mit einem der Steine kollidiert
        for (i in raster.stein) {
            if (raster.stein[i].platziert == true) {
                outerCollisionCheck(ball, ball.posX, ball.posY, raster.stein[i]);
            }
        }

        // Teste, ob der Ball mit einer der Wände kollidiert
        innerCollisionCheck(ball);
        ball.applySpeedLimit();

        // Geschwindigkeit wirkt, d.h. Ball bewegt sich
        ball.letztesX = ball.posX;
        ball.letztesY = ball.posY;

        ball.posX += ball.geschwX * deltaTime / 100;
        ball.posY += ball.geschwY * deltaTime / 100;
    }

    // 2. Zeichnen

    //schwarzer Hintergrund für das Spielfeld
    fill('black');
    noStroke();
    rect(0, 0, spielfeld.breite, spielfeld.hoehe);

    // Plattform
    fill('#006699');
    stroke('#cceeff');
    strokeWeight(plattform.strokeGewicht);
    rect(plattform.posX, plattform.posY, plattform.breite, plattform.hoehe, plattform.eckRadius, plattform.eckRadius, plattform.eckRadius, plattform.eckRadius); //draw a rectangle with rounded corners;
                                         //syntax: rect(x, y, w, [h], [tl], [tr], [br], [bl])

    if (!ball.gestartet) {
        resetGame();

        if (interface.level == 0)   interface.startbildschirm();
        else if (interface.level == -1) interface.gameOverBildschirm(); 
        else if (interface.level > 0 && interface.levelComplete == true && interface.level < interface.maxLevel) 
            interface.levelCompleteBildschirm();  
        else if (interface.level == interface.maxLevel && interface.levelComplete == true)
            interface.gameCompleteBildschirm();
    }

    // Steine zeichnen
    if (interface.level > 0) {
        for (i = 0; i < raster.anzahlPlaetzeX * raster.anzahlPlaetzeY; i++) {
            if (raster.stein[i].platziert == true) {
                raster.stein[i].zeichne();
            } 
        }
    }

    // Ball zeichnen
    ball.drawObject(); 
    
    // Pausenbildschirm zeichnen
    if (interface.pausiert === true) {
        interface.pausenBildschirm();
    }

    // Rahmen Spielfeld
    spielfeld.create();

    // Inventarfeld mit Rahmen
    fill('black');
    stroke('white');
    strokeWeight(3);
    rect(spielfeld.breite, 0, canvasWidth - spielfeld.breite, canvasHeight); //top left is 0, 0

    noStroke();
    interface.herz.update();      

    //task 11: draw number of points
    interface.zeichneHUD();
}



/* UTILITY FUNCTIONS */
///////////////////////

//task 8 and 9: reset ball
function resetGame() {
    // Ball an den Start setzen
    ball.posX = ball.startPosX;
    ball.posY = ball.startPosY;

    ball.letztesX = -100;
    ball.letztesY = -100;

    // reset ball speed;
    ball.geschwX = 0;
    ball.geschwY = 0;

    // reset ball color
    ball.rot = ball.startRot;
    ball.gruen = ball.startGruen;

    ball.gestartet = false;
}

/* Ball functions */
function innerCollisionCheck() {
    // Teste, ob der Ball die Wände berührt

    if (ball.posY > spielfeld.hoehe - ball.durchmesser/2) {
        // Ball berührt den Boden
        //play crash sound
        crashSound.play();

        if (interface.leben > 0) {
            resetGame();
            interface.leben--;
        }
        if (interface.leben == 0) {
            interface.level = -1;
        }
    }

    if (ball.posY < ball.durchmesser / 2) {
        // Ball prallt von der Decke ab
        ball.geschwY = abs(ball.geschwY);
        
        //play collission sound
        collideSound.play();
    }

    if (ball.posX > spielfeld.breite - ball.durchmesser/2) {
        // Ball prallt von der rechten Wand ab
        ball.geschwX = abs(ball.geschwX) * -1;
        
        //play collission sound
        collideSound.play();
    }

    if (ball.posX < ball.durchmesser/2) {
        // Ball prallt von der linken Wand ab
        ball.geschwX = abs(ball.geschwX);

        //play collission sound
        collideSound.play();
    }
}

function outerCollisionCheck(sphere, sphereX, sphereY, rechteck) {
    //implemented the approach described at: http://www.jeffreythompson.org/collision-detection/circle-rect.php

    if (sphere.letztesX != -100 &&  sphere.letztesY != -100) {

        //check if the ball was too fast to track a collision and use this function recursively 
        //for steps in-between
        let zwischenX;
        let zwischenY;

        if (sphere.letztesX != -100 &&  sphere.letztesY != -100) {
            if (Math.abs(sphereX - sphere.letztesX) >= sphere.durchmesser/5
            || Math.abs(sphereY - sphere.letztesY) >= sphere.durchmesser/5) {
                zwischenX = sphereX - (sphereX - sphere.letztesX)/5;
                zwischenY = sphereY - (sphereY - sphere.letztesY)/5;
                outerCollisionCheck(sphere, zwischenX, zwischenY, rechteck);
            }    
        }

        //define rectangle's edges
        let topEdge = rechteck.posY - rechteck.strokeGewicht;
        let bottomEdge = rechteck.posY + rechteck.hoehe + rechteck.strokeGewicht;
        let leftEdge = rechteck.posX - rechteck.strokeGewicht;
        let rightEdge = rechteck.posX + rechteck.breite + rechteck.strokeGewicht;

        //declare temporary variables for the rectangle's closest x/y egdes
        //set them as the circle's position to start
        let testX = sphereX;
        let testY = sphereY;

        //test on which side(s) of the rectangle the circle is
        if (sphereX < leftEdge) 
            testX = leftEdge; // left edge
        else if (sphereX > rightEdge) 
            testX = rightEdge; // right edge

        if (sphereY < topEdge) 
            testY = topEdge; // top edge
        else if (sphereY > bottomEdge) 
            testY = bottomEdge; // bottom edge

        //Now that we know which edges to check, we run the Pythagorean Theorem code 
        //using the circle’s center and the two edges we found above:
        let distX = sphereX - testX;
        let distY = sphereY - testY;
        let distance = Math.sqrt( (distX*distX) + (distY*distY) );

        //Finally, we compare this distance to the circle’s radius:
        if (distance <= sphere.durchmesser/2) {
            
            //play collission sound
            let collideSoundOuter = rechteck.sound;
            collideSoundOuter.play();
            //collideSoundOuter.currentTime = 0;

            let distanceTop = sphereY - topEdge;
            let distanceRight = rightEdge - sphereX;
            let distanceBottom = bottomEdge - sphereY;
            let distanceLeft = sphereX - leftEdge;   

            //find out, which edge has the smallest distance to the ball in order to see on
            //which side the collision took place
            let distanceArray = [distanceTop, distanceRight, distanceBottom, distanceLeft];
            let smallestDistance = distanceTop;
            let indexSmallest = 0;
            for (let e = 1; e < distanceArray.length; e++) {
                if (distanceArray[e] < smallestDistance) {
                    smallestDistance = distanceArray[e];
                    indexSmallest = e;
                }
            }

            if (indexSmallest == 0) {
                //ball collided with TOP of platform
                sphere.posY = topEdge - sphere.durchmesser/2 - 1;
                sphere.letztesY = sphere.posY;
                sphere.geschwY = abs(sphere.geschwY) * -1;
            }
            else if (indexSmallest == 1) {
                //ball collided with RIGHT edge of platform
                sphere.posX = rightEdge + sphere.durchmesser/2 + 1;
                sphere.letztesX = sphere.posX;
                sphere.geschwX = abs(sphere.geschwX);
            }
            if (indexSmallest == 2) {
                //ball collided with BOTTOM EDGE of platform
                sphere.posY = bottomEdge + sphere.durchmesser/2 + 1;
                sphere.letztesY = sphere.posY;
                sphere.geschwY = abs(sphere.geschwY);
            }
            else if (indexSmallest == 3) {
                //ball collided with LEFT EDGE of platform
                sphere.posX = leftEdge - sphere.durchmesser/2 - 1;
                sphere.letztesX = sphere.posX;
                sphere.geschwX = abs(sphere.geschwX) * -1;
            }

            if (rechteck.zerstoerbar == true) {
                // nachfolgende Bedingung verhindert, dass die Funktion 
                // mehrfach aufgerufen wird, wodurch zu viele Punkte gutgeschrieben würden
                if (rechteck.platziert == true) {
                    rechteck.platziert = false;
                    interface.punkte += rechteck.punkte;
                    if (interface.punkte > interface.highScore) {
                        interface.highScore = interface.punkte;
                        localStorage.setItem('highScore', interface.highScore);
                    }
                    raster.steinzahl--;

                    // wenn der letzte Stein entfernt wurd
                    if (raster.steinzahl == 0) {
                        resetGame();
                        interface.levelComplete = true;
                        levelCompleteSound.play();    
                    }
                    return;
                }
            }
            return;
        }
    }
}
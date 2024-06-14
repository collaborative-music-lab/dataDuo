// This file sets up the p5 sketch using the elements and themes
(function(global) {
    const sketch = (p) => {
        let grey = p.color(220, 229, 234);

        p.setup = function() {
            let divID = p.canvas.parentElement.id;
            let div = document.getElementById(divID)
            //let div = document.getElementById('p5-container');
            p.initialize(div);
        };

        p.draw = function () {
        p.drawElements();
    };

    p.mousePressed = function () {
        for (const element of Object.values(p.elements)) {
            if (typeof (element) !== 'string') {
                try {
                    element.isPressed();
                } catch (e) {
                    //no pressed function
                }
            }
        }
    }

    p.mouseReleased = function () {
        for (const element of Object.values(p.elements)) {
            if (typeof (element) !== 'string') {
                try {
                    element.isReleased();
                } catch (e) {
                    //no releaed function
                }
            }
        }
    }

    p.mouseClicked = function () {
        for (const element of Object.values(p.elements)) {
            if (typeof (element) !== 'string') {
                try {
                    element.isClicked();
                } catch (e) {
                    //no clicked function
                }
            }
        }
    }

    p.mouseDragged = function () {
        for (const element of Object.values(p.elements)) {
            if (typeof (element) !== 'string') {
                try {
                    element.isDragged();
                } catch (e) {
                    //no clicked function
                }
            }
        }
    }

    p.windowResized = function() {
        let containerDiv = document.getElementById('p5-container');
        p.resizeCanvas(containerDiv.offsetWidth, containerDiv.offsetHeight);
    };
    };

    global.sketch = sketch;
})(this);

import { createElement, Text, Wrapper } from "./createElement";
import { Timeline, Animation } from "./animation";
import { ease, linear } from "./cubic_bezier";

export class Carousel {
  constructor(config) {
    this.children = [];
    this.attributes = new Map();
    this.properties = new Map();
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  mountTo(parent) {
    this.render().mountTo(parent);
  }

  render() {
    let position = 0;
    let timeline = new Timeline();
    timeline.start();

    let nextPicStopHandler = null;

    let children = this.data.map((url, currentPosition) => {
      let lastPosition =
        (currentPosition - 1 + this.data.length) % this.data.length;
      let nextPosition = (currentPosition + 1) % this.data.length;

      let offset = 0;
      const onStart = () => {
        timeline.pause();
        clearTimeout(nextPicStopHandler);
        let currentElement = children[currentPosition];
        let currentTransformValue = currentElement.style.transform.match(
          /translateX\(([\s\S]+)px\)$/
        )[1];
        let offset = currentTransformValue + 500 * currentPosition;
      };

      const onPan = (event) => {
        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];
        let dx = event.clientX - event.startX;
        let currentTransformValue = -500 * currentPosition + offset + dx;
        let lastTransformValue = -500 - 500 * lastPosition + offset + dx;
        let nextTransformValue = 500 - 500 * nextPosition + offset + dx;
        
        lastElement.style.transform = `translateX(${lastTransformValue}px)`;
        currentElement.style.transform = `translateX(${currentTransformValue}px)`;
        nextElement.style.transform = `translateX(${nextTransformValue}px)`;
      };

      const onPanend = (event) => {
        let direction = 0;
        let dx = event.clientX - event.startX;
        if (dx + offset > 250) {
          direction = 1;
        } else if (dx + offset < -250) {
          direction = -1;
        }
        timeline.reset();
        timeline.start();

        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];
          let lastAnimation = new Animation(
            lastElement.style,
            "transform",
            (v) => `translateX(${v}px)`,
            -500 - 500 * lastPosition + offset + dx,
            -500 - 500 * lastPosition + direction * 500,
            500,
            0,
            ease
          );
          let currentAnimation = new Animation(
            currentElement.style,
            "transform",
            (v) => `translateX(${v}px)`,
            -500 * currentPosition + offset + dx,
            -500 * currentPosition + direction * 500,
            500,
            0,
            ease
          );

          let nextAnimation = new Animation(
            nextElement.style,
            "transform",
            (v) => `translateX(${v}px)`,
            500 - 500 * nextPosition + offset + dx,
            500 - 500 * nextPosition + direction * 500,
            500,
            0,
            ease
          );
          timeline.add(lastAnimation);
          timeline.add(currentAnimation);
          timeline.add(nextAnimation);

          position = (position - direction + this.data.length) % this.data.length
          nextPicStopHandler = setTimeout(nextPic,3000)
          
      };

      let element = (
        <img src={url} onStart={onStart} onPan={onPan} onPanend={onPanend} enableGesture={true} />
      );
      element.style.transform = "translateX(0px)";
      element.addEventListener("dragstart", (event) => event.preventDefault());
      return element;
    });

    let nextPic = () => {
      let nextPosition = (position + 1) % this.data.length;
      let current = children[position];
      let next = children[nextPosition];

      let currentAnimation = new Animation(
        current.style,
        "transform",
        (v) => `translateX(${5 * v}px)`,
        -100 * position,
        -100 - 100 * position,
        500,
        0,
        ease
      );

      let nextAnimation = new Animation(
        next.style,
        "transform",
        (v) => `translateX(${5 * v}px)`,
        100 - 100 * nextPosition,
        -100 * nextPosition,
        500,
        0,
        ease
      );
      timeline.add(currentAnimation);
      timeline.add(nextAnimation);
      position = nextPosition;

      nextPicStopHandler = setTimeout(nextPic, 1000);
    };
    nextPicStopHandler = setTimeout(nextPic, 1000);
    return <div class="carousel">{children}</div>;
  }
  mountTo(parent) {
    this.render().mountTo(parent);
  }
}
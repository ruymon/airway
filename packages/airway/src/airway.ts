interface LogArgumentsType {
  msg: string;
  type?: "error" | "warn" | "info" | "debug" | "log";
}

interface AirwayConfig {
  height?: number | string;
  backgroundColor?: string;
  resizable?: boolean;
  colorFromLeft?: string;
  colorFromRight?: string;
  lazy?: boolean;
  log?: boolean;
}

const defaultConfig: AirwayConfig = {
  height: 130,
  lazy: true,
  backgroundColor: "",
  resizable: false,
  colorFromLeft: "blue",
  colorFromRight: "red",
  log: false,
};

function getRandomSeconds(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min) * 1000;
}

export class Airway {
  container!: HTMLElement;
  config;
  interval: any = 0;

  constructor(container: HTMLElement | string, config: AirwayConfig = {}) {
    this.setContainer(container);
    this.config = { ...defaultConfig, ...config };
  }

  #log({ msg, type = 'log'}: LogArgumentsType) {
    if (!this.config.log) return;

    if (console[type]) {
      console[type](msg);
      return;
    }

    console.log(msg);
  }

  setContainer(container: HTMLElement | string) {
    if (typeof container === "string") {
      // TODO: check if container exists
      this.container = document.querySelector(container)!;
      return;
    }

    this.container = container;
  }

  setConfig(config: AirwayConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  configContainer() {
    // TODO: Check types
    this.container.style.background = this.config.backgroundColor!;
    this.container.style.height = `${this.config.height}px`;

    if (this.config.resizable) this.container.style.resize = "vertical";

    document.documentElement.style.setProperty(
      "--airplane-left-fill-color",
      this.config.colorFromLeft!
      // TODO: check if color is valid
    );
    document.documentElement.style.setProperty(
      "--airplane-right-fill-color",
      this.config.colorFromRight!
      // TODO: check if color is valid
    );
  }

  generateAirplane() {
    const randomClass = Math.random() < 0.5 ? "airplaneRight" : "airplaneLeft";
    const randomPlane = `
        <div class="${randomClass} airplaneContent">
            <div class="airplaneLine"></div>
            <svg width="34" height="32" viewBox="0 0 34 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" >
                <path d="M23.579 -8.39233e-05H20.2106L11.7895 13.4736H2.52632C1.12842 13.4736 0 14.6021 0 16C0 17.3979 1.12842 18.5263 2.52632 18.5263H11.7895L20.2106 32H23.579L19.3685 18.5263H28.6317L31.158 21.8947H33.6843L32.0001 16L33.6843 10.1052H31.158L28.6317 13.4736H19.3685L23.579 -8.39233e-05Z" />
            </svg>
        </div>
    `;

    this.container.insertAdjacentHTML("beforeend", randomPlane);
  }

  clearAirplanes(maxLimit: number): void {
    const airplanesFlying = this.container.querySelectorAll(".airplaneContent");

    airplanesFlying.forEach((airplane, index) => {
      if (index > maxLimit - 1) {
        airplane.remove();
        this.#log({
          msg: "Airplane removed",
        });
      }
    });
  }

  updateTimeout() {
    const time = this.config.lazy
      ? getRandomSeconds(3, 6)
      : getRandomSeconds(0, 0);
    const airplaneCount =
      this.container.querySelectorAll(".airplaneContent").length;

    const containerHeightLimit = this.container.offsetHeight;
    const airplaneCountLimit = Math.floor(containerHeightLimit / 32);

    this.#log({
      msg: `INFO: This container fits: ${airplaneCountLimit} airplane(s) and currently we have: ${airplaneCount} airplane(s) flying!`,
      type: "warn",
    });

    if (airplaneCount >= airplaneCountLimit) {
      this.clearAirplanes(airplaneCountLimit);
    } else {
      this.generateAirplane();
    }

    clearInterval(this.interval);

    if (airplaneCount < airplaneCountLimit)
      this.interval = setInterval(() => this.updateTimeout.call(this), time);
    else {
      this.#log({
        msg: "INFO: Airplane limit reached!",
        type: "info",
      });
    }
  }
  
  executeAirplanes() {
    clearInterval(this.interval);
    this.configContainer();
    this.interval = setInterval(() => this.updateTimeout.call(this), 0);

    const containerHeight = this.container.offsetHeight;

    new ResizeObserver(() => {
      const newContainerHeight = this.container.offsetHeight;
      if (containerHeight === newContainerHeight) return;

      this.#log({
        msg: `Container has been resized to: ${newContainerHeight}`,
        type: "info",
      });
      this.updateTimeout();
    }).observe(this.container);
  }

  dispose() {
    clearInterval(this.interval);
  }
}

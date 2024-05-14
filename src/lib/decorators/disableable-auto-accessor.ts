// type Constructor<T = {}> = new (...args: any[]) => T;

// function disableable<T extends Constructor>(Base: T) {
//   return class extends Base {
//     private _disabled: () => boolean = () => false;

//     get disabled(): boolean {
//       return this._disabled();
//     }
//     set disabled(value: boolean | (() => boolean)) {
//       this._disabled = typeof value === 'function' ? value : () => value;
//       this._disabled() ? this.disable() : this.enable();
//     }

//     constructor(...args: any[]) {
//       super(...args);
//     }
//   };
// }

// class InputNumber {
//   @disableable disabled: boolean | (() => boolean) = false;

//   enable() {
//     console.log("Enabled");
//   }

//   disable() {
//     console.log("Disabled");
//   }
// }

// class InputColor {
//   @disableable disabled: boolean | (() => boolean) = false;

//   enable() {
//     console.log("Enabled");
//   }

//   disable() {
//     console.log("Disabled");
//   }
// }

// // Usage
// const inputNumber = new InputNumber();
// inputNumber.disabled = true; // Should trigger disable
// inputNumber.disabled = false; // Should trigger enable

// const inputColor = new InputColor();
// inputColor.disabled = () => true; // Should trigger disable
// inputColor.disabled = () => false; // Should trigger enable

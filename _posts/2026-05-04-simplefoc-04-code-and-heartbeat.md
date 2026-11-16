---
title: "SimpleFOC Integrated Board from Zero to One - Part 4"
title_zh: "SimpleFOC 一体板从零到一（四）：代码解读与心跳灯"
excerpt: "Reading the example firmware line by line and adding a heartbeat indicator to make the board's state visible."
excerpt_zh: "逐段解读示例固件，并加上心跳指示灯，让板卡的运行状态一眼可见。"
date: 2026-05-04 16:10:10 +0800
categories: [projects, simplefoc]
tags: [simplefoc, arduino, altium, stm32f103cbt6, motor]
permalink: /posts/simplefoc-04-code-and-heartbeat/
image: /assets/img/simplefoc-part4.png
series: "SimpleFOC Integrated Board"
series_no: 4
series_total: 4
---

<span data-zh-title="SimpleFOC 一体板从零到一（四）：代码解读与心跳灯" hidden></span>

<div class="bi-lang-en" markdown="1">

<span class="bi-lang-mark" data-lang="en" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC Integrated Board · From Zero to One</p>
  <p class="bi-series-nav">Design &amp; build notes · Part 4 of 4 · <a href="/posts/simplefoc-03-power-up-and-software/">&larr; Prev</a></p>
</div>

**SimpleFOC Integrated Board Hardware Practice: From Zero to One (4) – Interpreting the Code and add heartbeat function**

### Interpreting the Code

This article mainly explains the code.  
The example is based on the official **SimpleFOC** example: `full_control_serial.ino`.

```cpp
#include <SimpleFOC.h>
//#define USE_HSI
// magnetic sensor instance - SPI
//MagneticSensorSPI sensor = MagneticSensorSPI(AS5147_SPI, 10);
// magnetic sensor instance - MagneticSensorI2C
MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);
//MagneticSensorI2C sensor = MagneticSensorI2C(0x36, 12, 0X0C, 4);
// magnetic senso    r instance - analog output
// MagneticSensorAnalog sensor = MagneticSensorAnalog(A1, 14, 1020);

// BLDC motor & driver instance
//BLDCMotor motor = BLDCMotor(11);
BLDCMotor motor = BLDCMotor(7);   //your brushless motor
//BLDCDriver3PWM driver = BLDCDriver3PWM(9, 5, 6, 8);
BLDCDriver3PWM driver = BLDCDriver3PWM(PB0, PB1, PB4, PA6);
// Stepper motor & driver instance
//StepperMotor motor = StepperMotor(50);
//StepperDriver4PWM driver = StepperDriver4PWM(9, 5, 10, 6,  8);

//LED
int ledState = LOW;             // used to set the LED state
unsigned long previousMillis = 0;  //will store last time LED was blinked
const long period = 400;         // period at which to blink in ms
#define ledPin PB3

// commander interface
Commander command = Commander(Serial);
void onMotor(char* cmd) {
  command.motor(&motor, cmd);
}


void setup() {

  pinMode(PB3, OUTPUT);

  // initialise magnetic sensor hardware
  sensor.init();
  // link the motor to the sensor
  motor.linkSensor(&sensor);

  // driver config
  // power supply voltage [V]
  driver.voltage_power_supply = 12;
  driver.init();
  // link driver
  motor.linkDriver(&driver);

  // choose FOC modulation
  motor.foc_modulation = FOCModulationType::SpaceVectorPWM;

  // set control loop type to be used
  // set motion control loop to be used
  // MotionControlType::torque
  // MotionControlType::velocity
  // MotionControlType::angle
//  motor.controller = MotionControlType::angle;
  //bi4wms add bellow comment above
  motor.controller = MotionControlType::torque;
  
  // contoller configuration based on the control type
/*
  motor.PID_velocity.P = 0.2f;
  motor.PID_velocity.I = 20;
  motor.PID_velocity.D = 0;
*/
//bi4wms comment above add bellow
    motor.PID_velocity.P = 0.1f;
  motor.PID_velocity.I = 10;
  motor.PID_velocity.D = 0;
  
  // default voltage_power_supply
 // motor.voltage_limit = 12;
    motor.voltage_limit = 0.5; //bi4wms

  // velocity low pass filtering time constant
  motor.LPF_velocity.Tf = 0.01f;
/*
  // angle loop controller
  motor.P_angle.P = 20;
  // angle loop velocity limit
  motor.velocity_limit = 50;
*/
//bi4wms comment above add bellow
  // angle loop controller
  motor.P_angle.P = 10;
  // angle loop velocity limit
  motor.velocity_limit = 20;

  // use monitoring with serial for motor init
  // monitoring port
  Serial.begin(115200);
  // comment out if not needed
  motor.useMonitoring(Serial);

  // initialise motor
  motor.init();
  // align encoder and start FOC
  motor.initFOC();

  // set the inital target value
  motor.target = 0;

  // define the motor id
  command.add('M', onMotor, "motor");

  // Run user commands to configure and the motor (find the full command list in docs.simplefoc.com)
  Serial.println(F("Motor commands sketch | Initial motion control > torque/voltage : target 2V."));
  Serial.println(F("====bi4wms SETUP SUCESS====."));
}


void loop() {
  // iterative setting FOC phase voltage
  motor.loopFOC();

  // iterative function setting the outter loop target
  // velocity, position or voltage
  // if tatget not set in parameter uses motor.target variable
  motor.move();

  // user communication
  command.run();

    LEDblink();
}


void LEDblink()
{
  unsigned long currentMillis = millis(); // store the current time
  if (currentMillis - previousMillis >= period) { // check if 1000ms passed
    previousMillis = currentMillis;   // save the last time you blinked the LED
    if (ledState == LOW) { // if the LED is off turn it on and vice-versa
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    digitalWrite(ledPin, ledState);//set LED with ledState to blink again
  }
}
```

### Main Modifications

1. **Power supply**
2. **DRV8313 driver chip control pins**
3. **Motor pole pair parameters** (different brushless motors have different numbers of pole pairs)
4. **Magnetic encoder related settings**

After completing the modifications, upload the code and test it using serial commands.

---

### Adding a Heartbeat Indicator

When designing hardware circuits, in addition to the power supply indicator LED, a **heartbeat indicator LED** is typically added to indicate that the software system is running normally. This design is no exception.
<img width="661" height="336" alt="image" src="https://github.com/user-attachments/assets/ae1b7cf8-474b-45d1-b82a-d7af8815fd00" />


Most beginner Arduino projects use `delay()` to blink an LED. However, when using the **FOC (Field Oriented Control)** vector control algorithm for the motor, using `delay()` becomes very inappropriate. Using Arduino’s FreeRTOS would also consume too many system resources.

After research, the `millis()` function can be used to achieve a non-blocking heartbeat LED. The key code is as follows:

**Variable and function declarations for the heartbeat:**

```cpp
//LED
int ledState = LOW;             // used to set the LED state
unsigned long previousMillis = 0;  //will store last time LED was blinked
const long period = 1000;         // period at which to blink in ms
#define ledPin PB3
void LEDblink();
```
** Heartbeat function:**

```cpp
void LEDblink()
{
  unsigned long currentMillis = millis(); // store the current time
  if (currentMillis - previousMillis >= period) { // check if 1000ms passed
    previousMillis = currentMillis;   // save the last time you blinked the LED
    if (ledState == LOW) { // if the LED is off turn it on and vice-versa
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    digitalWrite(ledPin, ledState);//set LED with ledState to blink again
  }
}
```

** Add heartbeat function to loop():**

```cpp

void loop() {
  // iterative setting FOC phase voltage
  motor.loopFOC();

  // iterative function setting the outter loop target
  // velocity, position or voltage
  // if tatget not set in parameter uses motor.target variable
  motor.move();

  // user communication
  command.run();

  LEDblink();
}
```

</div>

<div class="bi-lang-zh" markdown="1">

<span class="bi-lang-mark" data-lang="zh" hidden></span>

<div class="bi-series">
  <p class="bi-series-name">SimpleFOC 一体板 · 从零到一</p>
  <p class="bi-series-nav">设计与调试实录 · 第 4 篇 / 共 4 篇 · <a href="/posts/simplefoc-03-power-up-and-software/">&larr; 上一篇</a></p>
</div>

**SimpleFOC 一体板硬件实践：从零到一（4）—— 代码解读与添加心跳功能**

### 代码解读

本文主要讲解代码。  
示例基于官方 **SimpleFOC** 示例：`full_control_serial.ino`。

```cpp
#include <SimpleFOC.h>
//#define USE_HSI
// magnetic sensor instance - SPI
//MagneticSensorSPI sensor = MagneticSensorSPI(AS5147_SPI, 10);
// magnetic sensor instance - MagneticSensorI2C
MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);
//MagneticSensorI2C sensor = MagneticSensorI2C(0x36, 12, 0X0C, 4);
// magnetic senso    r instance - analog output
// MagneticSensorAnalog sensor = MagneticSensorAnalog(A1, 14, 1020);

// BLDC motor & driver instance
//BLDCMotor motor = BLDCMotor(11);
BLDCMotor motor = BLDCMotor(7);   //your brushless motor
//BLDCDriver3PWM driver = BLDCDriver3PWM(9, 5, 6, 8);
BLDCDriver3PWM driver = BLDCDriver3PWM(PB0, PB1, PB4, PA6);
// Stepper motor & driver instance
//StepperMotor motor = StepperMotor(50);
//StepperDriver4PWM driver = StepperDriver4PWM(9, 5, 10, 6,  8);

//LED
int ledState = LOW;             // used to set the LED state
unsigned long previousMillis = 0;  //will store last time LED was blinked
const long period = 400;         // period at which to blink in ms
#define ledPin PB3

// commander interface
Commander command = Commander(Serial);
void onMotor(char* cmd) {
  command.motor(&motor, cmd);
}


void setup() {

  pinMode(PB3, OUTPUT);

  // initialise magnetic sensor hardware
  sensor.init();
  // link the motor to the sensor
  motor.linkSensor(&sensor);

  // driver config
  // power supply voltage [V]
  driver.voltage_power_supply = 12;
  driver.init();
  // link driver
  motor.linkDriver(&driver);

  // choose FOC modulation
  motor.foc_modulation = FOCModulationType::SpaceVectorPWM;

  // set control loop type to be used
  // set motion control loop to be used
  // MotionControlType::torque
  // MotionControlType::velocity
  // MotionControlType::angle
//  motor.controller = MotionControlType::angle;
  //bi4wms add bellow comment above
  motor.controller = MotionControlType::torque;
  
  // contoller configuration based on the control type
/*
  motor.PID_velocity.P = 0.2f;
  motor.PID_velocity.I = 20;
  motor.PID_velocity.D = 0;
*/
//bi4wms comment above add bellow
    motor.PID_velocity.P = 0.1f;
  motor.PID_velocity.I = 10;
  motor.PID_velocity.D = 0;
  
  // default voltage_power_supply
 // motor.voltage_limit = 12;
    motor.voltage_limit = 0.5; //bi4wms

  // velocity low pass filtering time constant
  motor.LPF_velocity.Tf = 0.01f;
/*
  // angle loop controller
  motor.P_angle.P = 20;
  // angle loop velocity limit
  motor.velocity_limit = 50;
*/
//bi4wms comment above add bellow
  // angle loop controller
  motor.P_angle.P = 10;
  // angle loop velocity limit
  motor.velocity_limit = 20;

  // use monitoring with serial for motor init
  // monitoring port
  Serial.begin(115200);
  // comment out if not needed
  motor.useMonitoring(Serial);

  // initialise motor
  motor.init();
  // align encoder and start FOC
  motor.initFOC();

  // set the inital target value
  motor.target = 0;

  // define the motor id
  command.add('M', onMotor, "motor");

  // Run user commands to configure and the motor (find the full command list in docs.simplefoc.com)
  Serial.println(F("Motor commands sketch | Initial motion control > torque/voltage : target 2V."));
  Serial.println(F("====bi4wms SETUP SUCESS====."));
}


void loop() {
  // iterative setting FOC phase voltage
  motor.loopFOC();

  // iterative function setting the outter loop target
  // velocity, position or voltage
  // if tatget not set in parameter uses motor.target variable
  motor.move();

  // user communication
  command.run();

    LEDblink();
}



void LEDblink()
{
  unsigned long currentMillis = millis(); // store the current time
  if (currentMillis - previousMillis >= period) { // check if 1000ms passed
    previousMillis = currentMillis;   // save the last time you blinked the LED
    if (ledState == LOW) { // if the LED is off turn it on and vice-versa
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    digitalWrite(ledPin, ledState);//set LED with ledState to blink again
  }
}
```

### 主要修改

1. **电源**
2. **DRV8313 驱动芯片控制引脚**
3. **电机极对数参数**（不同无刷电机的极对数不同）
4. **磁编码器相关设置**

修改完成后，上传代码并用串口命令测试。

---

### 添加心跳指示灯

设计硬件电路时，除电源指示灯外，通常还会加一颗 **心跳指示灯**，用来表明软件系统运行正常。本设计也不例外。
<img width="661" height="336" alt="image" src="https://github.com/user-attachments/assets/ae1b7cf8-474b-45d1-b82a-d7af8815fd00" />


多数 Arduino 入门项目用 `delay()` 来让 LED 闪烁。但在电机使用 **FOC（磁场定向控制）** 矢量控制算法时，用 `delay()` 就非常不合适了；而采用 Arduino 的 FreeRTOS 又会占用过多系统资源。

经研究，可用 `millis()` 函数实现非阻塞的心跳灯。关键代码如下：

**心跳灯的变量与函数声明：**

```cpp
//LED
int ledState = LOW;             // used to set the LED state
unsigned long previousMillis = 0;  //will store last time LED was blinked
const long period = 1000;         // period at which to blink in ms
#define ledPin PB3
void LEDblink();
```
** 心跳函数：**

```cpp
void LEDblink()
{
  unsigned long currentMillis = millis(); // store the current time
  if (currentMillis - previousMillis >= period) { // check if 1000ms passed
    previousMillis = currentMillis;   // save the last time you blinked the LED
    if (ledState == LOW) { // if the LED is off turn it on and vice-versa
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    digitalWrite(ledPin, ledState);//set LED with ledState to blink again
  }
}
```

** 在 loop() 中添加心跳函数：**

```cpp

void loop() {
  // iterative setting FOC phase voltage
  motor.loopFOC();

  // iterative function setting the outter loop target
  // velocity, position or voltage
  // if tatget not set in parameter uses motor.target variable
  motor.move();

  // user communication
  command.run();

  LEDblink();
}
```

</div>

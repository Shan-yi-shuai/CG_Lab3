# CG_Lab3
# 1 项目目录

- image
- lib
- model
- 3DWalker.html
- 3DWalker.js
- Camera.js
- Cube.js
- Keyboard.js
- MyVector3.js
- Object.js
- objLoader.js
- scene.js
- Texture.js
# 2 开发及运行环境

- Chrome
- wampserver

# 3 运行及使用方法

1. 将项目文件CG_Lab3放入 /wamp64/www中
2. 在Chrome浏览器中使用[http://localhost/CG_Lab3/3DWalker.html](http://localhost/BaseCode/3DWalker.html)来访问

# 4 项目中的亮点
实现了雾化效果。通过计算视点和物体的距离来设置物体的颜色，从而达到近看清晰远看模糊的效果。

# 5 开发过程中遇到的问题（以及你的解决办法）
## 问题1
绘制立方体的时候需要解析scene.js文件中给出的参数，因为参数的结构和Texure.js使用的参数不同，所以需要根据参数结构重写vertexAttribPointer方法的参数
解决方法：
考虑到每六个元素中前三个是坐标，后三个是颜色，所以修改如下
`this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, FSIZE * 6, 0);`
`this.gl.vertexAttribPointer(this.a_Color, 3, this.gl.FLOAT, false, FSIZE * 6, FSIZE * 3);`
## 问题2
在设计鸟的飞行动画的时候，为了让动画看起来比较自然，所以鸟的自转和公转速度不能随意设置。但是一开始我试了很多组速度发现都不对。
解决方法：
根据常识可知，鸟绕一个物体转一圈，应该恢复一开始的状态，所以公转一圈的同时，鸟应该自转一圈，也就是公转和自转的角速度相同。但考虑到公转是靠物体的位置来控制的，而自转是通过rotate控制的，所以自转的角度需要乘上_**180 / Math.PI**_
解决方案如下
```
let angle1 = 90 - dt * 0.005 * 180 / Math.PI; // Adjust speed of rotation
let angle2 = dt * 0.005; // Adjust speed of rotation

let radius = 5;
let pivot = [0, 8, -5];

// Calculate new position of bird based on angle, radius, and height
let x = pivot[0] - Math.cos(angle2) * radius;
let y = pivot[1] + Math.sin(angle2) * radius * 0.5;
let z = pivot[2] - Math.sin(angle2) * radius;

// Apply translation and rotation transformations to bird
let transform = [{ type: "translate", content: [x, y, z] },
    { type: "rotate", content: [angle1, 0, 1, 0] },
    { type: "scale", content: [5, 5, 5] }
];

loader.updateTransform(transform)
```
# 6 项目仍然或者可能存在的缺陷（以及你的思考）
感觉这次实现的效果和助教提供的效果展示没有什么区别，不管是从功能还是流畅度上都复刻的很好。
不过我觉得仍然有改进的空间。
#### 代码结构
在功能点的迭代过程中，我在不断的修改VSHADER_SOURCE和FSHADER_SOURCE的内容，以及初始化shader的函数。因为这个项目的工作量相对比较小，所以直接进行修改也问题不大，但假如说迭代的次数很多，并且增加的功能很复杂，可能因为某个修改出现问题，但很难发现，且代码可读性和可维护性都比较差。
因为VSHADER_SOURCE和FSHADER_SOURCE本质上是字符串，所以我觉得可以将字符串分成几部分并存储在数组里面，从而可以动态更新shader，这样可以很明确的知道每次对shader的修改的具体内容是什么，目的是什么，同时shader的初始化也可以按照类似的思路拆分开，这样就可以不用每次取修改函数内部的内容，而是通过增加一个功能明确的函数来实现。
#### 渲染
对于图形的渲染，原本采取的方案是每隔一段时间重新渲染一次，假如说场景非常复杂，可能会导致卡顿。我觉得在重新渲染一个物体之前可以判断这个物体实际上有没有改变，如果没有改变就不重新渲染这个物体。不过对于我们这个项目，因为渲染的物体比较少，所以也没什么关系。
# 7 具体功能实现
## 1.1    校准相机姿态
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683599223196-af76b79e-6bd7-4dd1-9bfb-6f28525925d2.png#averageHue=%23090b06&clientId=u5b383a15-0f3f-4&from=paste&height=451&id=ucb405fed&originHeight=902&originWidth=903&originalType=binary&ratio=2&rotation=0&showTitle=false&size=229339&status=done&style=none&taskId=ud68bd2a4-8382-4f60-9a9e-ee12872cdd6&title=&width=451.5)
```
// Camera.js
Camera.at = new Vector3(CameraPara.at);
Camera.eye = new Vector3(CameraPara.eye);
Camera.up = new Vector3(CameraPara.up);
```

## 1.2   变换投影方式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683599267045-6a12fad1-b32b-4ff7-891c-37271f8077b1.png#averageHue=%233da059&clientId=u5b383a15-0f3f-4&from=paste&height=451&id=u20632256&originHeight=902&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=269514&status=done&style=none&taskId=uec540c9d-8660-42ce-9832-c59877dde96&title=&width=450)
```
// Camera.js
static getMatrix() {
    return new Matrix4()
        .perspective(Camera.fov, 1, Camera.near, Camera.far)
        // .ortho(-20.0, 20.0, -20.0, 20.0, -10.0, 200.0)
        .lookAt(Camera.eye.elements[0], Camera.eye.elements[1], Camera.eye.elements[2],
            Camera.at.elements[0], Camera.at.elements[1], Camera.at.elements[2],
            Camera.up.elements[0], Camera.up.elements[1], Camera.up.elements[2]);
}
```
## 1.3  绘制简单三维模型
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683715296865-f4fadabe-f873-442b-9c5a-68015d2c9825.png#averageHue=%235f8b9f&clientId=ubba3c2a3-7288-4&from=paste&height=452&id=u7f47d5ef&originHeight=903&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=264186&status=done&style=none&taskId=u8a785e03-4612-41be-adce-320ba666751&title=&width=450)
见_**Cube.js**_文件
## 1.4  更换纹理
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683715613008-4979335b-2807-42ea-b7b9-ef917047866a.png#averageHue=%238d663f&clientId=ubba3c2a3-7288-4&from=paste&height=448&id=u406666c7&originHeight=896&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=412857&status=done&style=none&taskId=u7677fe43-1eac-42b9-939d-3c552b69985&title=&width=450)
```
// Texture.js
// Load texture image
this.textureImage = new Image();
this.textureImage.src = this.entity.texImagePath;
this.textureImage.onload = () => {
    this.handleTextureLoad();
};
```
## 1.5  读取并绘制复杂模型
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683715770241-79a855bb-4a3f-48e2-adb4-6a635ea2c3b4.png#averageHue=%238d663f&clientId=ubba3c2a3-7288-4&from=paste&height=450&id=u35747fa5&originHeight=899&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=415338&status=done&style=none&taskId=u2a46d0c9-fd3f-44d3-b9f8-326036cbb82&title=&width=450)
去掉原本代码中的continue即可

## 1.6  实现简单动画
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683720120937-994a7a69-0bb9-4009-8ab2-9af2e54eefd1.png#averageHue=%238d663f&clientId=ubba3c2a3-7288-4&from=paste&height=449&id=uea82d3eb&originHeight=898&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=414901&status=done&style=none&taskId=udc920692-c722-4149-be5d-a069170b0e8&title=&width=450)
```
// 3DWalker.js
if (o.objFilePath.indexOf('bird') > 0) {
    loader.update = (dt) => {
        // Update angle and height based on time
        let angle1 = 90 - dt * 0.005 * 180 / Math.PI; // Adjust speed of rotation
        let angle2 = dt * 0.005; // Adjust speed of rotation

        let radius = 5;
        let pivot = [0, 8, -5];

        // Calculate new position of bird based on angle, radius, and height
        let x = pivot[0] - Math.cos(angle2) * radius;
        let y = pivot[1] + Math.sin(angle2) * radius * 0.5;
        let z = pivot[2] - Math.sin(angle2) * radius;

        // Apply translation and rotation transformations to bird
        let transform = [{ type: "translate", content: [x, y, z] },
            { type: "rotate", content: [angle1, 0, 1, 0] },
            { type: "scale", content: [5, 5, 5] }
        ];

        loader.updateTransform(transform)
    }
}

// Object.js
updateTransform(transform) {
    this.g_modelMatrix = new Matrix4();
    this.g_normalMatrix = new Matrix4();
    for (let t of transform) {
        this.g_modelMatrix[t.type].apply(this.g_modelMatrix, t.content);
    }
}
```

## 1.7  实现光照
平行光和环境光
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683728912853-d3c3be0b-0bb1-48bf-8aa9-29db05680860.png#averageHue=%238d663f&clientId=ubba3c2a3-7288-4&from=paste&height=450&id=ud283e72c&originHeight=900&originWidth=901&originalType=binary&ratio=2&rotation=0&showTitle=false&size=415022&status=done&style=none&taskId=u1dca3982-6750-4511-869e-1ce2ac2455d&title=&width=450.5)
```
// Object.js
let lightDirection = new Vector3(sceneDirectionLight);
lightDirection.normalize();
this.gl.uniform3fv(this.u_LightDirection, lightDirection.elements);
this.gl.uniform3fv(this.u_AmbientLight, new Vector3(sceneAmbientLight).elements);
```

点光源
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683732197417-15ee21ec-7e1c-413e-a426-006e478fc770.png#averageHue=%238d663f&clientId=ubba3c2a3-7288-4&from=paste&height=450&id=u17719cfe&originHeight=900&originWidth=902&originalType=binary&ratio=2&rotation=0&showTitle=false&size=415901&status=done&style=none&taskId=uc65975f4-5c62-462f-8723-85b8601b8c0&title=&width=451)
```
// Object.js
let VSHADER_SOURCE = 
`
...
vec4 vertexPosition = u_ModelMatrix * a_Position;
vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
`

if (openLight) {
    this.gl.uniform3fv(this.u_LightPosition, new Vector3(pointLight.position).elements);
    this.gl.uniform3fv(this.u_AmbientLight, new Vector3(pointLight.color).elements);
}

// 3DWalker.js
for (let loader of this.loaders) {
    loader.render(timestamp, Camera.pointLight, Camera.state.openLight);
}

cameraMap.set('f', 'openLight');

// Camera.js
// 创建点光源
this.pointLight = {
    position: new Float32Array([Camera.eye.elements[0], Camera.eye.elements[1], Camera.eye.elements[2]]),
    color: new Float32Array(scenePointLightColor)
};
// 更新点光源的位置
this.pointLight.position[0] = Camera.eye.elements[0];
this.pointLight.position[1] = Camera.eye.elements[1];
this.pointLight.position[2] = Camera.eye.elements[2];

```
## 1.8 实现场景漫游
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683733013029-bd2d8581-8006-4188-9006-521624a3fb61.png#averageHue=%232f2923&clientId=ubba3c2a3-7288-4&from=paste&height=451&id=u83ee8482&originHeight=901&originWidth=900&originalType=binary&ratio=2&rotation=0&showTitle=false&size=470694&status=done&style=none&taskId=u50fea860-9a7f-469c-9667-5092573aa36&title=&width=450)
```
// 3DWalker.js
cameraMap.set('w', 'posUp');
cameraMap.set('s', 'posDown');
cameraMap.set('i', 'rotUp');
cameraMap.set('k', 'rotDown');


let posX = (Camera.state.posUp - Camera.state.posDown) * MOVE_VELOCITY * elapsed / 1000;
let rotX = (Camera.state.rotUp - Camera.state.rotDown) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

if (posX) Camera.move(posX, 0, this.position_text, this.lookat_text);
if (rotX) Camera.rotate(rotX, 0, this.position_text, this.lookat_text);
```

## 1.9  雾化
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683819496124-c995f67b-b958-4deb-9116-2dd8fdaa0bfa.png#averageHue=%23655e56&clientId=ucf2bd8ff-25db-4&from=paste&height=895&id=u99c9a17b&originHeight=895&originWidth=896&originalType=binary&ratio=1&rotation=0&showTitle=false&size=341138&status=done&style=none&taskId=u9169c173-6711-4461-ad09-099e443737a&title=&width=896)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22886185/1683819523279-878350ed-38cb-482a-a686-ae004d8637e2.png#averageHue=%235a5652&clientId=ucf2bd8ff-25db-4&from=paste&height=894&id=ud12f91fc&originHeight=894&originWidth=899&originalType=binary&ratio=1&rotation=0&showTitle=false&size=292541&status=done&style=none&taskId=ue4613fe0-57e0-454d-bbda-d381139a3fd&title=&width=899)

```
// Object.js
let FSHADER_SOURCE = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec4 v_Color;

uniform vec3 u_FogColor;
uniform vec2 u_FogDist;
varying float v_Dist;
void main() {
  float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
  vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);
  gl_FragColor = vec4(color, v_Color.a);
}`;

this.u_Eye = this.gl.getUniformLocation(this.program, 'u_Eye');
this.u_FogColor = this.gl.getUniformLocation(this.program, 'u_FogColor')
this.u_FogDist = this.gl.getUniformLocation(this.program, 'u_FogDist')

// 雾化效果
let fogColor = new Float32Array([0.137, 0.231, 0.423]);
let fogDist = new Float32Array([55, 80]);
// eye = new Float32Array([25, 65, 35, 1.0]);
this.gl.uniform3fv(this.u_FogColor, fogColor); //雾的颜色
this.gl.uniform2fv(this.u_FogDist, fogDist); //雾化的起点和终点与视点间的距离 [起点距离,终点距离]
this.gl.uniform4fv(this.u_Eye, new Vector4(new Float32Array([eye.elements[0], eye.elements[1], eye.elements[2], 1.0])).elements); //视点
```

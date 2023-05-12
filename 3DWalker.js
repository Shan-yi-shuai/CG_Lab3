"use strict";

window.onload = () => {
    let canvas = document.getElementById('webgl');
    let positon_text = document.getElementById('position');
    let lookat_text = document.getElementById('lookat');
    canvas.setAttribute("width", 500);
    canvas.setAttribute("height", 500);
    window.ratio = canvas.width / canvas.height;
    let gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Load a new scene
    new SceneLoader(gl, positon_text, lookat_text).init();
};

class SceneLoader {
    constructor(gl, positon_text, lookat_text) {
        this.gl = gl;
        this.position_text = positon_text;
        this.lookat_text = lookat_text;
        this.loaders = [];
        this.keyboardController = new KeyboardController();
    }

    init() {
        this.initKeyController();

        this.initLoaders();

        let render = (timestamp) => {
            this.initWebGL();

            this.initCamera(timestamp);

            for (let loader of this.loaders) {
                if (loader.update) {
                    loader.update(timestamp);
                }
            }

            for (let loader of this.loaders) {
                loader.render(timestamp, Camera.eye, Camera.pointLight, Camera.state.openLight);
            }

            requestAnimationFrame(render, this.gl);
        };

        render();
    }


    initWebGL() {
        // Set clear color and enable hidden surface removal
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear color and depth buffer
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    initKeyController() {
        Camera.init();

        let cameraMap = new Map();
        cameraMap.set('a', 'posLeft');
        cameraMap.set('d', 'posRight');
        cameraMap.set('j', 'rotLeft');
        cameraMap.set('l', 'rotRight');

        cameraMap.set('w', 'posUp');
        cameraMap.set('s', 'posDown');
        cameraMap.set('i', 'rotUp');
        cameraMap.set('k', 'rotDown');

        cameraMap.set('f', 'openLight');

        cameraMap.forEach((val, key) => {
            this.keyboardController.bind(key, {
                on: (() => {
                    Camera.state[val] = 1;
                }),
                off: (() => {
                    Camera.state[val] = 0;
                })
            });
        })
    }

    initCamera(timestamp) {
        let elapsed = timestamp - this.keyboardController.last;
        this.keyboardController.last = timestamp;

        let posY = (Camera.state.posRight - Camera.state.posLeft) * MOVE_VELOCITY * elapsed / 1000;
        let rotY = (Camera.state.rotRight - Camera.state.rotLeft) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

        if (posY) Camera.move(0, posY, this.position_text, this.lookat_text);
        if (rotY) Camera.rotate(0, rotY, this.position_text, this.lookat_text);

        let posX = (Camera.state.posUp - Camera.state.posDown) * MOVE_VELOCITY * elapsed / 1000;
        let rotX = (Camera.state.rotUp - Camera.state.rotDown) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

        if (posX) Camera.move(posX, 0, this.position_text, this.lookat_text);
        if (rotX) Camera.rotate(rotX, 0, this.position_text, this.lookat_text);

    }

    initLoaders() {
        // Load floor
        let floorLoader = new TextureLoader(floorRes, {
            'gl': this.gl,
            'activeTextureIndex': 0,
            'enableLight': true
        }).init();
        this.loaders.push(floorLoader);

        // Load box
        let boxLoader = new TextureLoader(boxRes, {
            'gl': this.gl,
            'activeTextureIndex': 1,
            'enableLight': true
        }).init();
        this.loaders.push(boxLoader);

        // Load cube
        let cubeLoader = new CubeLoader(cubeRes, {
            'gl': this.gl,
            'enableLight': true
        }).init();
        this.loaders.push(cubeLoader);

        // Load objects
        for (let o of ObjectList) {
            let loader = new ObjectLoader(o, { 'gl': this.gl }).init();
            // Add animation to bird
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
            this.loaders.push(loader);
        }
    }

    //     initLight() {
    //         // 定义顶点着色器
    //         const vertexShaderSource = `
    //   attribute vec4 a_position;

    //   void main() {
    //     gl_Position = a_position;
    //   }
    // `;

    //         // 定义片元着色器
    //         const fragmentShaderSource = `
    //   precision mediump float;

    //   // 定义平行光颜色和方向
    //   uniform vec3 uLightColor;
    //   uniform vec3 uLightDirection;

    //   // 定义环境光颜色
    //   uniform vec3 uAmbientColor;

    //   void main() {
    //     // 计算平行光照射方向
    //     vec3 lightDirection = normalize(uLightDirection);

    //     // 计算平行光照射强度
    //     float directionalLightWeighting = max(dot(normalize(vec3(0.0, 0.0, 1.0)), lightDirection), 0.0);
    //     vec3 directionalLight = uLightColor * directionalLightWeighting;

    //     // 计算环境光照射强度
    //     vec3 ambientLight = uAmbientColor;

    //     // 计算最终颜色
    //     vec3 finalColor = directionalLight + ambientLight;

    //     gl_FragColor = vec4(finalColor, 1.0);
    //   }
    // `;

    //         // 创建顶点着色器对象
    //         const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    //         this.gl.shaderSource(vertexShader, vertexShaderSource);
    //         this.gl.compileShader(vertexShader);

    //         // 创建片元着色器对象
    //         const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    //         this.gl.shaderSource(fragmentShader, fragmentShaderSource);
    //         this.gl.compileShader(fragmentShader);

    //         // 创建着色器程序对象
    //         const program = this.gl.createProgram();
    //         this.gl.attachShader(program, vertexShader);
    //         this.gl.attachShader(program, fragmentShader);
    //         this.gl.linkProgram(program);
    //         this.gl.useProgram(program);

    //         // 设置平行光颜色和方向
    //         const lightColorLocation = this.gl.getUniformLocation(program, 'uLightColor');
    //         this.gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0); // 设置白色平行光

    //         const lightDirectionLocation = this.gl.getUniformLocation(program, 'uLightDirection');
    //         this.gl.uniform3fv(lightDirectionLocation, new Float32Array(sceneDirectionLight)); // 设置平行光方向朝向屏幕

    //         // 设置环境光颜色
    //         const ambientColorLocation = this.gl.getUniformLocation(program, 'uAmbientColor');
    //         this.gl.uniform3fv(ambientColorLocation, new Float32Array(scenePointLightColor)); // 设置灰色环境光
    //     }
}
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Material
const material = new THREE.MeshToonMaterial({ color: '#5900ff' })
const materialTwo = new THREE.MeshToonMaterial({ color: '#4f98ff' })
//const material = new THREE.MeshToonMaterial({ color: '#ffeded' })
const materialOne = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("#5d00ff")
      },
      color2: {
        value: new THREE.Color("#ae00ff")
      }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
    wireframe: false
  });

/**
 * Objects
 */
// Meshes
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(),
    materialOne
)
const mesh3 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    materialTwo
)

//https://i.imgur.com/dfLCd19.jpg
//https://i.imgur.com/MeKgLts.jpg

scene.add(mesh1, mesh2, mesh3)

const objectsDistance = 4
mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1.38
mesh3.position.y = - objectsDistance * 2.5
mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2

const sectionMeshes = [ mesh1 ]

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
 const clock = new THREE.Clock()
 let previousTime = 0
var isSlide = true
var slideAmount = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    //console.log(deltaTime)

    // Animate meshes
    for(const mesh of sectionMeshes) {
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    for(const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.2
        mesh.rotation.y += deltaTime * 0.24
    }

    mesh3.rotation.x += deltaTime * 0.02
    mesh3.rotation.y += deltaTime * 0.06

    mesh2.rotation.x += deltaTime * 0.4
    mesh2.rotation.y += deltaTime * 0.48

    if(isSlide) {
        mesh2.position.x += 0.01
        mesh2.position.z += 0.008
        slideAmount += 1
        if(slideAmount === 500) {
            isSlide = !isSlide
        }
    } else {
        mesh2.position.x -= 0.01
        mesh2.position.z -= 0.008
        slideAmount -= 1
        if(slideAmount === 0) {
            isSlide = !isSlide
        }
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

/**
 * Lights
 */
 const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
 directionalLight.position.set(1, 1, 0)
 scene.add(directionalLight)

 /**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0
var oldValue = 0;
var isIntroSlide = true
var introSlideAmount = 0

window.addEventListener('scroll', () => {
    //moveAccordingly(window.pageYOffset)
    newValue = window.pageYOffset
    if(oldValue - newValue < 0) {
        if(isIntroSlide) {
            mesh1.position.x -= 0.01
            mesh1.position.z -= 0.01
            introSlideAmount += 1
            if(introSlideAmount === 200) {
                isIntroSlide = !isIntroSlide
            }
        } else {
            mesh1.position.x += 0.01
            mesh1.position.z += 0.01
            introSlideAmount -= 1
            if(introSlideAmount === 0) {
                isIntroSlide = !isIntroSlide
            }
        }
    } else {
        if(isIntroSlide) {
            mesh1.position.x -= 0.01
            mesh1.position.z -= 0.01
            introSlideAmount += 1
            if(introSlideAmount === 200) {
                isIntroSlide = !isIntroSlide
            }
        } else {
            mesh1.position.x += 0.01
            mesh1.position.z += 0.01
            introSlideAmount -= 1
            if(introSlideAmount === 0) {
                isIntroSlide = !isIntroSlide
            }
        }
    }
    
    oldValue = newValue

    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection) {
        currentSection = newSection

        console.log('changed', currentSection)
        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=3'
        })
    }
})

/*var isZoomOut = false
function moveAccordingly(newValue) {
    if(oldValue - newValue < 0) {
        if (isZoomOut) {
            if (mesh1.position.z > 3) {
                mesh1.position.z += 0.1
                mesh1.position.x += 0.01
                mesh1.position.y += 0.1
            } else if (mesh1.position.z === 3) {
                isZoomOut = !isZoomOut
            }
        } else {
            if (mesh1.position.z < 3) {
                mesh1.position.z -= 0.1
                mesh1.position.x -= 0.01
                mesh1.position.y -= 0.1
            } else if (mesh1.position.z === 0) {
                isZoomOut = !isZoomOut
            }
        }
    } else if(oldValue - newValue > 0) {
        mesh1.position.z += 0.1
    }

    oldValue = newValue
}*/

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
    //console.log(cursor)
})

/**
 * Particles
 */
// Geometry
const particlesCount = 400
const positions = new Float32Array(particlesCount * 3)
for(let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = 10 * 0.5 - Math.random() * 10 * 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: '#ffeded',
    sizeAttenuation: true,
    size: 0.03
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

tick()

//---------------------------------------------------------Below is the code for text sphere

const myTags = [
    'JavaScript', 'CSS', 'HTML', 'PHP', 'Python', 'Java', 'Swift', 
    'ReactJS', 'git', 'Jetpack Compose', 'Flutter', 'PostgreSQL',
    'SwiftUI', 'NodeJS', 'Firebase', 'Spring', 'MongoDB', 'AWS', 
    'MySQL', 'jQuery', 'Flask', 'Jira', 'Github', 'NPM', 'Dart'
];

var tagCloud = TagCloud('.content', myTags, {
    radius: 300,
    // slow, normal, fast
    maxSpeed: 'slow',
    initSpeed: 'slow',
    // 0 = top
    // 90 = left
    // 135 = right-bottom
    direction: 135,
    keep: false
});

document.querySelector('.content').style.color = 'pink';
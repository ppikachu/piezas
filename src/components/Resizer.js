const setSize = (camera, renderer, composer, objectSize = 6) => {
  const width = window.innerWidth
  const height = window.innerHeight
  let padding = 1 //HACK: to frame with a black border

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  let w = objectSize + padding;
  let h = objectSize + padding;

  let fovX = camera.fov * (width / height);
  let fovY = camera.fov;

  let distanceX = (w / 2) / Math.tan(Math.PI * fovX / 360) + (w / 2);
  let distanceY = (h / 2) / Math.tan(Math.PI * fovY / 360) + (w / 2);

  let distance = Math.max(distanceX, distanceY)
  camera.position.z = distance;
  //console.log(distance)

  // fix composer
  renderer.setSize( width, height )
  composer.setSize(width, height)
}

class Resizer {
  constructor(camera, renderer, composer) {
    // set initial size on load
    setSize(camera, renderer, composer)

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(camera, renderer, composer)
    })
  }
}

export { Resizer }
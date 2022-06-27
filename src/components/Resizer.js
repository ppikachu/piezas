const setSize = (camera, composer) => {
  camera.aspect = 1
  camera.updateProjectionMatrix()
  const width = window.innerWidth
  composer.setSize(width, width)
  //console.log(camera, composer)
}

class Resizer {
  constructor(camera, composer) {
    // set initial size on load
    setSize(camera, composer)

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(camera, composer)
    })
  }
}

export { Resizer }
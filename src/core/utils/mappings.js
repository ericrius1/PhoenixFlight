import { Vector2, MathUtils } from 'three'

const clamp = MathUtils.clamp
const mapLinear = MathUtils.mapLinear
export function worldPositionToCanvasCoordinate(
  worldPosition,
  worldWidth,
  canvasWidth,
  canvasHeight,
  clamped = true,
) {
  let xCanvasCoord = Math.floor(
    mapLinear(worldPosition.x, -worldWidth / 2, worldWidth / 2, 0, canvasWidth),
  )
  let yCanvasCoord = Math.floor(
    mapLinear(
      worldPosition.z,
      -worldWidth / 2,
      worldWidth / 2,
      0,
      canvasHeight,
    ),
  )
  if (clamped) {
    xCanvasCoord = clamp(xCanvasCoord, 0, canvasWidth)
    yCanvasCoord = clamp(yCanvasCoord, 0, canvasHeight)
  }
  return new Vector2(xCanvasCoord, yCanvasCoord)
}

export function canvasCoordinatesToWorldPosition() {}

export function getPixelIndexfromCoordinates(x, y, width) {
  return y * (width * 4) + x * 4
}

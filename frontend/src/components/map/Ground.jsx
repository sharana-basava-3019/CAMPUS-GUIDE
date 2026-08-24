// Ground — mint green base with light road lines, matching reference image
export default function Ground() {
  return (
    <group>
      {/* Main green ground tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#6DBE8A" roughness={0.92} metalness={0} />
      </mesh>

      {/* Main horizontal road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[36, 1.2]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.95} metalness={0} />
      </mesh>

      {/* Main vertical road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[1.2, 36]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.95} metalness={0} />
      </mesh>

      {/* Secondary horizontal roads */}
      {[-9, 9].map((z, i) => (
        <mesh key={`hr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, z]}>
          <planeGeometry args={[36, 0.7]} />
          <meshStandardMaterial color="#D8EFE0" roughness={0.95} metalness={0} />
        </mesh>
      ))}

      {/* Secondary vertical roads */}
      {[-9, 9].map((x, i) => (
        <mesh key={`vr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.007, 0]}>
          <planeGeometry args={[0.7, 36]} />
          <meshStandardMaterial color="#D8EFE0" roughness={0.95} metalness={0} />
        </mesh>
      ))}

      {/* Campus border (thin raised lip) */}
      {[
        [0, 0.15, -17.5, 36, 0.3, 0.6],
        [0, 0.15,  17.5, 36, 0.3, 0.6],
        [-17.5, 0.15, 0, 0.6, 0.3, 36],
        [ 17.5, 0.15, 0, 0.6, 0.3, 36],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={`border-${i}`} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#E9E4D6" roughness={0.9} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

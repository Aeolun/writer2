// Simple test story without vanilla-extract to verify plugin works
export default (props: { Hst: any }) => {
  const { Hst } = props

  return (
    <Hst.Story title="Test Component" group="components">
      <Hst.Variant title="Basic">
        <div style={{ padding: '20px', background: '#f0f0f0' }}>
          <h1>Hello from Solid!</h1>
          <p>This is a test component</p>
        </div>
      </Hst.Variant>

      <Hst.Variant title="With Button">
        <button style={{ padding: '10px 20px' }}>Click me</button>
      </Hst.Variant>
    </Hst.Story>
  )
}

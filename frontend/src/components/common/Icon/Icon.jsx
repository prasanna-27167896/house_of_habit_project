const Icon = ({ icon: IconComponent, bg = '#333', color = '#fff', size = 20, padding = 6 }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        padding: `${padding}px`,
        borderRadius: '50%',
      }}
    >
      <IconComponent
        style={{
          width: size,
          height: size,
          color: color,
        }}
      />
    </span>
  );
};

export default Icon;

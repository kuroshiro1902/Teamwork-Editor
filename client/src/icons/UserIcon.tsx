function UserIcon({ width = 20, height = 20, color = "lightgreen" }) {
  return (
    <svg
      style={{ marginTop: "-8px" }}
      xmlns='http://www.w3.org/2000/svg'
      width={width + "px"}
      height={height + "px"}
      viewBox={`0 0 ${width} ${height}`}
      fill={color}
    >
      <path
        d='M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z'
        stroke='#000000'
        strokeWidth='1'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z'
        stroke='#000000'
        strokeWidth='1'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default UserIcon;

# g5_proj-g5_proj-471573

Trình chỉnh sửa mã nguồn trực tiếp trên cùng 1 editor để hoạt động theo nhóm.
Các thành viên trong cùng 1 project có thể xem được các hoạt động của các thành viên khác, đồng thời có thể chỉnh sửa các file code và nhận xét code trong dự án đó.

Được xây dựng bằng [Monaco Editor](https://microsoft.github.io/monaco-editor/) và [Socket.io](https://socket.io/).

## Thông tin nhóm
- [Bùi Thanh Sơn - B20DCCN573](https://github.com/kuroshiro1902)
- [Trần Minh Nghĩa - B20DCCN471](https://github.com/MinhNghiaTran01)

## Chức năng chính
- Đăng nhập, đăng kí tài khoản, join project.
- Tương tác thời gian thực giữa các member trong cùng một project trên cửa sổ editor.
- Hiển thị các member vừa kết nối, các member đang hoạt động và các member đang offline.
- Một member có thể thấy được mọi hành động của các member khác trong cùng một project như: Tạo mới folder, tạo mới file, sửa đổi nội dung file, bôi đen nội dung trên editor, nhận xét nội dung, ...


## Mô tả kiến trúc, giao tiếp

Kiến trúc:

[![Socket](https://socket.io/images/server-class-diagram-server-dark.png)]()

Giao tiếp:
- Engine.IO: Engine.IO chịu trách nhiệm thiết lập kết nối cấp thấp giữa server và client. Nó thiết lập kết nối cấp thấp giữa máy chủ và máy khách và có cơ chế phát hiện ngắt kết nối, nó là bộ lõi xử lý của Websocket.
- Websocket: Giao thức Websocket cung cấp kênh liên lạc hai chiều và có độ trễ thấp giữa máy chủ và máy khách qua một kết nối TCP.
- HTTP long-polling: Client sẽ kết nối với Server trong một khoảng thời gian cố định. Nếu server không có bất kỳ thông tin nào, nó sẽ giữ yêu cầu mở cho đến khi có thông tin hoặc hết thời hạn được chỉ định (hết thời gian chờ).
- Handshake: Khi bắt đầu kết nối Engine.IO, máy chủ sẽ gửi một số thông tin như sessionId, pingTimeout, ... SessionId là id của phiên làm việc, nó phải được đưa vào tham số truy vấn trong tất cả các yêu cầu HTTP tiếp theo để duy trì kết nối giữa client và server. Nếu thời gian pingTimeout chưa kết thúc thì sessionId vẫn còn hiệu lực.


## Preview giao diện
Đang cập nhật
## Cài đặt môi trường
Đang cập nhật
## Triển khai
Đang cập nhật

## Công nghệ sử dụng

Ngôn ngữ:

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)


Thư viện, framework:

[![ReactJS](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)

[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en)

[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)


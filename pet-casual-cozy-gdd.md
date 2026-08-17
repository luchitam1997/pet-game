# Pet Haven — Game Design Document (Concept / MVP)

## 1. Tóm tắt dự án

**Pet Haven** là game mô phỏng nuôi thú cưng phong cách casual/cozy, tối ưu cho điện thoại nhưng chạy trên web. Người chơi nhận nuôi chó và mèo, chăm sóc các nhu cầu hằng ngày, chơi mini-game nhẹ nhàng, grooming, phối đồ và xây dựng không gian sống đáng yêu cho các bé.

Trải nghiệm cần ấm áp, không gây áp lực và phù hợp với các phiên chơi ngắn 5–15 phút. Pet **không chết, không bị phạt nặng** khi người chơi vắng mặt. Mục tiêu là tạo cảm giác muốn quay lại chăm bé, sưu tầm và cá nhân hóa.

| Hạng mục | Định hướng |
| --- | --- |
| Nền tảng | Mobile-first web (portrait), có thể mở rộng desktop |
| Engine | Cocos Creator + TypeScript |
| Thể loại | Cozy pet life simulator / casual collection |
| Đối tượng | Người thích chó mèo, dress-up, decorating, game thư giãn |
| Nhịp chơi | 5–15 phút/lần, vòng lặp hằng ngày nhẹ |
| Business model | Cosmetic-first, không gacha, không pay-to-win |

## 2. Trụ cột trải nghiệm

1. **Pet có cá tính.** Mỗi bé có loài, ngoại hình, tính cách, sở thích thức ăn/đồ chơi và phản ứng riêng.
2. **Chăm sóc là niềm vui, không phải nghĩa vụ.** Chỉ số giảm chậm, có giới hạn an toàn; hoạt động luôn cho phản hồi nghe nhìn dễ thương.
3. **Thể hiện gu cá nhân.** Trang phục, phụ kiện, căn phòng và bộ sưu tập là động lực tiến triển chính.
4. **Nội dung mở rộng an toàn.** Pet, cosmetic, phòng và mùa mới được thêm qua dữ liệu/config, không cần sửa gameplay core.

## 3. Vòng lặp gameplay

```text
Nhận nuôi / mở khóa pet
        ↓
Chăm sóc: cho ăn, tắm, chơi, nghỉ ngơi
        ↓
Nhận coin + tình cảm + tiến độ collection
        ↓
Grooming, phối đồ, trang trí phòng
        ↓
Chụp/khoe không gian → mở mục tiêu nhẹ và nội dung mới
```

### Các chỉ số pet

- **Hunger** (no): tăng khi cho ăn.
- **Hygiene** (vệ sinh): tăng khi tắm/chải lông.
- **Happiness** (vui vẻ): tăng khi chơi, được tương tác và ở trong phòng đẹp.
- **Energy** (năng lượng): giảm khi chơi; hồi khi nghỉ.
- **Affection** (tình cảm): cấp tiến độ dài hạn, nhận từ mọi hoạt động chăm sóc.

Nguyên tắc cân bằng MVP: chỉ số có thang 0–100, giảm theo thời gian thực rất chậm; không chỉ số nào về 0 làm pet gặp hậu quả nghiêm trọng. Khi chỉ số thấp, UI chỉ gợi ý hoạt động phù hợp.

## 4. Hoạt động chính

### 4.1. Cho ăn

Người chơi chọn một món từ kho thức ăn rồi kéo/chạm để cho pet ăn. Mỗi pet có sở thích:

- Yêu thích: hồi no cao hơn, tăng thêm happiness.
- Bình thường: hồi no chuẩn.
- Không thích: vẫn ăn, hồi ít hơn và có animation hài hước.

MVP: 3 món thức ăn, 1 sở thích mỗi pet, không có hệ crafting/expiry.

### 4.2. Tắm và vệ sinh

Mini-game thao tác ngắn: xịt nước → bôi xà phòng → chà vùng bẩn → xả nước → sấy khô. Thanh tiến độ và trạng thái biểu cảm của pet phải rõ ràng.

MVP có thể đơn giản hóa thành 3 bước tap/drag và hoàn thành trong 20–40 giây. Phần thưởng: hygiene, happiness, coin nhỏ.

### 4.3. Vui chơi

Các mini-game 20–60 giây:

- Ném bóng / bắt bóng (tap đúng thời điểm).
- Dẫn tia laser cho mèo (kéo theo điểm đích).
- Tìm đồ chơi trong phòng (tap vật xuất hiện).

MVP chỉ cần một mini-game tái sử dụng được; khác biệt loài thể hiện bằng animation/skin, không cần nhiều luật chơi.

### 4.4. Grooming

Chải lông, cắt tỉa nhẹ và chọn style. Đây là cầu nối giữa chăm sóc và dress-up. MVP chỉ gồm chải lông và một lựa chọn style hiển thị; không làm hệ tóc/lông phức tạp.

### 4.5. Dress-up và phụ kiện

Cosmetic có slot độc lập: `head`, `neck`, `body`, `back`, `face`, `paw` (chỉ cần 3 slot đầu cho MVP). Khi thay đồ, preview cập nhật ngay trên pet. Một cosmetic có thể tương thích theo `species`, `bodyType` và `tags`.

Ví dụ cosmetic:

- Mũ thủy thủ, kính tròn (`head`/`face`)
- Bandana, vòng cổ (`neck`)
- Áo mưa, áo hoodie (`body`)
- Ba lô cánh nhỏ (`back`)

Không có chỉ số sức mạnh từ cosmetic.

### 4.6. Nhà/phòng

Phòng là màn hình hub của pet. Người chơi đặt đồ nội thất theo ô/vị trí neo định sẵn để đảm bảo UI mobile đơn giản. Mỗi phòng có chủ đề (Cozy, Beach, Autumn, Lunar New Year...).

MVP: 1 phòng, 4 vị trí đặt đồ, 6 món nội thất. Không cần kéo-thả tự do hay hệ va chạm.

## 5. Tiến độ và collection

### Tiền tệ và mở khóa

- **Coins:** nhận từ chăm sóc/mini-game/mục tiêu; dùng mua cosmetic và nội thất cơ bản.
- **Affection level:** tăng dần theo tương tác với từng pet; mở animation, pose, đồ yêu thích hoặc palette.
- **Collection:** album pet, cosmetic, furniture và seasonal badge đã sở hữu.

### Mục tiêu nhẹ

Ví dụ: “Cho Miso ăn 2 lần”, “Hoàn thành một lần tắm”, “Mặc 3 món thuộc Cozy set”. Reset theo ngày nhưng không tạo FOMO: mục tiêu bỏ lỡ không làm mất nội dung.

## 6. Seasonal content

Mỗi mùa/sự kiện là một gói dữ liệu gồm:

- khoảng thời gian hiển thị;
- theme UI/background;
- cosmetic và furniture set;
- nhiệm vụ/badge tùy chọn;
- danh sách item còn bán vĩnh viễn hoặc chuyển vào cửa hàng lưu trữ sau mùa.

Không dùng gacha, loot box hay giới hạn thời gian ép mua. Seasonal content nên thiên về collection và trang trí, có một phần unlock bằng chơi bình thường.

## 7. Monetization thân thiện

MVP có thể không cần thanh toán thật. Khi sẵn sàng, ưu tiên:

- cosmetic pack theo chủ đề, hiển thị rõ toàn bộ món trong gói;
- room theme hoặc pet appearance pack;
- supporter bundle một lần, không tạo lợi thế gameplay;
- tùy chọn bỏ quảng cáo (nếu game có rewarded ad), tuyệt đối không bắt buộc xem quảng cáo để chăm pet.

Không gacha, không năng lượng trả phí, không pay-to-win, không khóa nhu cầu cơ bản của pet sau paywall.

## 8. UX/UI mobile-first

- Thiết kế portrait 9:16 trước; các nút thao tác chính ở vùng ngón tay cái phía dưới.
- Hub có pet ở trung tâm, các action lớn: Feed, Clean, Play, Style.
- Chỉ hiển thị 2–3 chỉ số cần chú ý; các chỉ số khác ở chi tiết pet.
- Mỗi action có animation, âm thanh và toast phần thưởng ngắn.
- Chữ đủ lớn, tương phản tốt; không đặt thao tác quan trọng chỉ bằng màu.
- Có nút Back/Home luôn nhất quán, tránh modal lồng nhiều tầng.

## 9. Phạm vi MVP đề xuất

### Bao gồm

- 1 chó, 1 mèo với sở thích khác nhau.
- Hub phòng duy nhất, trạng thái pet lưu local.
- Feed, Clean, Play (1 mini-game), Rest; 5 chỉ số.
- 3 slot cosmetic và 6–10 item mẫu.
- 4 furniture anchor và 6 item mẫu.
- Coin, affection, collection và daily objectives đơn giản.
- Mock seasonal catalog để chứng minh có thể import nội dung.

### Không thuộc MVP

- Multiplayer/social/feed/chia sẻ online.
- Gacha, inventory phức tạp, crafting, breeding.
- Kéo-thả nội thất tự do, pathfinding, hệ vật lý nặng.
- Backend, đăng nhập, thanh toán thật, cloud save.
- Nhiều mini-game hoặc nhiều giống pet với rig khác nhau.

## 10. Kiến trúc kỹ thuật định hướng

### Nguyên tắc

- Cocos Creator 3.x + TypeScript, tách logic game khỏi component/UI.
- **Data-driven:** pet, food, activities, cosmetics, furniture, seasonal packs đọc từ data object/JSON-like module có schema rõ ràng.
- UI chỉ phát lệnh và render state; service/store mới xử lý luật chỉ số, phần thưởng và unlock.
- Lưu game bằng local storage qua một lớp `SaveService`; có version để migration sau này.
- Một event bus nhỏ chỉ dùng cho sự kiện xuyên màn hình như `pet:updated`, `inventory:changed`, `currency:changed`; không biến mọi hàm thành event.

### Mô hình dữ liệu gợi ý

```ts
type CosmeticSlot = 'head' | 'neck' | 'body' | 'back' | 'face' | 'paw';

interface CosmeticDefinition {
  id: string;
  slot: CosmeticSlot;
  displayName: string;
  species: Array<'dog' | 'cat' | 'any'>;
  tags: string[];
  assetKey: string;
  priceCoins?: number;
  seasonalPackId?: string;
}

interface PetState {
  id: string;
  definitionId: string;
  stats: { hunger: number; hygiene: number; happiness: number; energy: number; affection: number };
  equipped: Partial<Record<CosmeticSlot, string>>;
  lastUpdatedAt: number;
}
```

### Cấu trúc module gợi ý

```text
assets/scripts/
  data/          # catalog và seed content
  domain/        # types, stat rules, reward rules
  services/      # game state, save, inventory, clock
  events/        # typed event bus nhỏ
  ui/            # screen/panel/controller Cocos
  minigames/     # logic và scene/component mini-game
```

Nội dung mới chủ yếu là thêm `Definition` và asset mapping; không hard-code từng item vào UI. Khi chưa có asset thật, dùng placeholder và asset key ổn định.

## 11. Tiêu chí thành công prototype

Một người chơi mới có thể trong dưới 2 phút: chọn pet, hoàn thành feed/clean/play, thấy chỉ số và coin thay đổi, mặc một accessory và đặt một furniture. Sau khi reload trang, dữ liệu vẫn còn. Thêm một cosmetic mới qua catalog không cần sửa logic UI hoặc luật trang bị.


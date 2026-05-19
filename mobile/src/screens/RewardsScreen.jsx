import React, { useState } from 'react';
import {
  FlatList, Image, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/layout/AppHeader';
import { colors, radius, shadow } from '../theme';

/* ── 더미 데이터 (프론트엔드와 동일) ─────────────────────────────────────── */
const dummyCoupons = [
  { id: 1, brand: '버거킹', name: '불고기와퍼+콜라L+21치즈스틱', image: 'https://via.placeholder.com/200x200/FF6B35/FFFFFF?text=BK', barcode: '1 234 5678 9101 1121 3141 5161' },
  { id: 2, brand: '버거킹', name: '불고기와퍼+콜라L+21치즈스틱', image: 'https://via.placeholder.com/200x200/FF6B35/FFFFFF?text=BK', barcode: '2 345 6789 0123 4567 8901 2345' },
  { id: 3, brand: '버거킹', name: '치킨버거+콜라M', image: 'https://via.placeholder.com/200x200/FF6B35/FFFFFF?text=BK', barcode: '3 456 7890 1234 5678 9012 3456' },
  { id: 4, brand: '스타벅스', name: '아이스 아메리카노 T', image: 'https://via.placeholder.com/200x200/00704A/FFFFFF?text=SB', barcode: '4 567 8901 2345 6789 0123 4567' },
  { id: 5, brand: 'GS25', name: '모바일 상품권 5000원', image: 'https://via.placeholder.com/200x200/0066B2/FFFFFF?text=GS', barcode: '5 678 9012 3456 7890 1234 5678' },
  { id: 6, brand: 'CU', name: '삼각김밥 2개 교환권', image: 'https://via.placeholder.com/200x200/7C3AED/FFFFFF?text=CU', barcode: '6 789 0123 4567 8901 2345 6789' },
];

const BRANDS = ['선택', '버거킹', '스타벅스', 'GS25', 'CU'];

const BARCODE_PATTERN = [2,1,3,1,1,2,1,3,2,1,1,1,2,1,3,1,2,1,1,2,3,1,1,2,1,1,2,3,1,2,1,1,3,1,2,1,1,2,1,3,1,1,2,1,2,3,1,1,2,1,1,3,2,1,1,2,1,1,3,1,2,1,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,1,1,2,1,1];

/* ── 바코드 (View 기반, SVG 대체) ─────────────────────────────────────────── */
function Barcode({ number }) {
  return (
    <View style={bc.wrap}>
      <View style={bc.bars}>
        {BARCODE_PATTERN.map((w, i) =>
          i % 2 === 0
            ? <View key={i} style={[bc.bar, { width: w * 2.0 }]} />
            : <View key={i} style={{ width: w * 0.7 }} />
        )}
      </View>
      {number ? <Text style={bc.number}>{number}</Text> : null}
    </View>
  );
}
const bc = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  bars: { flexDirection: 'row', height: 70, alignItems: 'stretch', width: '100%', maxWidth: 300 },
  bar: { backgroundColor: '#111827', height: '100%' },
  number: { marginTop: 8, fontSize: 12, fontWeight: '600', color: colors.gray900, letterSpacing: 0.5, textAlign: 'center' },
});

/* ── 쿠폰 카드 (프론트 .coupon 그대로) ──────────────────────────────────── */
function CouponCard({ coupon, onPress }) {
  return (
    <TouchableOpacity style={s.coupon} onPress={() => onPress(coupon)} activeOpacity={0.85}>
      <View style={s.couponImageWrap}>
        <Image source={{ uri: coupon.image }} style={s.couponImage} resizeMode="contain" />
      </View>
      <Text style={s.couponBrand}>{coupon.brand}</Text>
      <Text style={s.couponName}>{coupon.name}</Text>
    </TouchableOpacity>
  );
}

/* ── 쿠폰 모달 (프론트 .coupon-window 그대로 — 화면 중앙) ───────────────── */
function CouponWindow({ coupon, onClose }) {
  return (
    <Modal visible={!!coupon} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.window} activeOpacity={1} onPress={() => {}}>
          {/* 닫기 버튼 */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* 이미지 */}
          <View style={s.windowImageWrap}>
            <Image source={{ uri: coupon?.image }} style={s.windowImage} resizeMode="contain" />
          </View>

          <Text style={s.windowBrand}>{coupon?.brand}</Text>
          <Text style={s.windowName}>{coupon?.name}</Text>

          {/* 바코드 */}
          <View style={s.barcodeArea}>
            <Barcode number={coupon?.barcode} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/* ── 브랜드 Select (프론트 .rewards-page__select 스타일) ─────────────────── */
function BrandSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={s.select} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={s.selectText}>{value}</Text>
        <Text style={s.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.selectOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.selectMenu}>
            {BRANDS.map((b) => (
              <TouchableOpacity key={b} style={s.selectOption} onPress={() => { onChange(b); setOpen(false); }}>
                <Text style={[s.selectOptionText, value === b && s.selectOptionActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ── 메인 화면 ───────────────────────────────────────────────────────────── */
export default function RewardsScreen() {
  const [selected, setSelected] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [brand, setBrand] = useState('선택');

  const filtered = dummyCoupons.filter((c) => {
    const matchBrand = brand === '선택' || c.brand === brand;
    const matchSearch = !searchText || c.name.includes(searchText) || c.brand.includes(searchText);
    return matchBrand && matchSearch;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={s.galleryRow}
        contentContainerStyle={s.galleryContent}
        renderItem={({ item }) => <CouponCard coupon={item} onPress={setSelected} />}
        ListHeaderComponent={
          <View>
            {/* 제목 */}
            <Text style={s.pageTitle}>쿠폰함</Text>
            <Text style={s.pageSubtitle}>적립된 포인트로 교환한 쿠폰을 확인하세요.</Text>

            {/* 포인트 요약 카드 */}
            <View style={s.pointsCard}>
              <View style={s.pointRow}>
                <Text style={s.pointLabel}>현재 보유 포인트 :</Text>
                <Text style={s.pointValue}><Text style={s.pointBold}>7,958</Text> P</Text>
              </View>
              <View style={s.pointRow}>
                <Text style={s.pointLabel}>소멸 예정 포인트 :</Text>
                <Text style={s.pointValue}><Text style={s.pointBold}>2,261</Text> P</Text>
              </View>
            </View>

            {/* 필터 바 (select + search 나란히) */}
            <View style={s.filterBar}>
              <BrandSelect value={brand} onChange={setBrand} />
              <TextInput
                style={s.searchInput}
                placeholder="상품을 검색하세요."
                placeholderTextColor={colors.gray400}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>
        }
      />

      <CouponWindow coupon={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

/* ── 스타일 (프론트 CSS 수치 그대로) ────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // 제목
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.gray900, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: colors.gray500, marginHorizontal: 20, marginBottom: 16 },

  // 포인트 카드 — padding:18px 22px, borderRadius:22, shadow
  pointsCard: {
    marginHorizontal: 20, marginBottom: 16,
    paddingVertical: 18, paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: colors.surface,
    ...shadow.card,
    gap: 8,
  },
  pointRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  pointLabel: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  pointValue: { fontSize: 13, color: colors.gray900 },
  pointBold: { fontSize: 18, fontWeight: '800' },

  // 필터 바 — display:flex gap:10
  filterBar: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },

  // Select — padding:10 14, border:1 gray-200, borderRadius:12
  select: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.gray200 || '#e5e7eb',
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  selectText: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  selectArrow: { fontSize: 11, color: colors.gray500 },

  // Search input — flex:1 padding:10 14, border:1 gray-200, borderRadius:12
  searchInput: {
    flex: 1,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.gray200 || '#e5e7eb',
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: 13, color: colors.gray900,
  },

  // Select 드롭다운 모달
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  selectMenu: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 6, minWidth: 140, ...shadow.card },
  selectOption: { paddingVertical: 12, paddingHorizontal: 20 },
  selectOptionText: { fontSize: 14, color: colors.gray700 },
  selectOptionActive: { fontWeight: '700', color: colors.primary },

  // 갤러리 — grid 2열, gap:12
  galleryContent: { paddingHorizontal: 20, paddingBottom: 32 },
  galleryRow: { gap: 12, marginBottom: 12 },

  // 쿠폰 카드 — border:1 gray-100, borderRadius:16, padding:16 12 14
  coupon: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1, borderColor: colors.gray100 || '#f3f4f6',
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingTop: 16, paddingHorizontal: 12, paddingBottom: 14,
  },
  couponImageWrap: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  couponImage: { width: '100%', height: '100%' },
  couponBrand: { fontSize: 12, color: colors.gray500, marginBottom: 2, textAlign: 'center' },
  couponName: { fontSize: 13, fontWeight: '700', color: colors.gray900, textAlign: 'center', lineHeight: 18 },

  // 쿠폰 모달 — 화면 중앙, max-width:360, borderRadius:22, padding:24 20 28
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  window: {
    position: 'relative',
    width: '100%', maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingTop: 24, paddingHorizontal: 20, paddingBottom: 28,
    alignItems: 'center',
    ...shadow.card,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: colors.gray600 },

  // 모달 이미지 — max-width:220, aspect:1
  windowImageWrap: { width: 220, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  windowImage: { width: '100%', height: '100%' },
  windowBrand: { fontSize: 13, color: colors.gray500, marginBottom: 2, textAlign: 'center' },
  windowName: { fontSize: 16, fontWeight: '800', color: colors.gray900, marginBottom: 18, textAlign: 'center' },

  // 바코드 영역
  barcodeArea: { width: '100%', alignItems: 'center' },
});

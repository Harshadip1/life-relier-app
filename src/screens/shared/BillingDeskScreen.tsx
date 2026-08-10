import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../utils/constants";
import { getBillingPatients, getPatientBill, savePayment, updatePayment, saveRefund, deletePayment, BillingPatient, PatientBill, ReceiptRecord } from "../../services/billingService";

const PAYMENT_TYPES  = ["Cash","Cheque","Card","Online"];
const STATUS_FILTERS = ["All","Paid","Unpaid","Partial"];

function toDate(d: Date) { return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDate(iso: string) { if (!iso) return "---"; try { return new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); } catch { return iso; } }
function fmtAmt(n: any) { return "Rs "+Number(n??0).toFixed(0); }
function statusColor(paid: number, balance: number) {
  if (balance > 0 && paid > 0) return { color:"#F59E0B", bg:"#FFFBEB", label:"Partial" };
  if (balance <= 0 && paid > 0) return { color:COLORS.success, bg:"#ECFDF5", label:"Paid" };
  return { color:COLORS.danger, bg:"#FEF2F2", label:"Unpaid" };
}

export default function BillingDeskScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const today = new Date();
  const [fromDate,setFromDate]     = useState(toDate(new Date(today.getFullYear(),today.getMonth(),1)));
  const [toDate2,setToDate2]       = useState(toDate(today));
  const [search,setSearch]         = useState("");
  const [statusFilter,setStatus]   = useState("All");
  const [patients,setPatients]     = useState<BillingPatient[]>([]);
  const [loading,setLoading]       = useState(false);
  const [selected,setSelected]     = useState<BillingPatient|null>(null);
  const [bill,setBill]             = useState<PatientBill|null>(null);
  const [billLoading,setBillLoad]  = useState(false);
  const [showPay,setShowPay]       = useState(false);
  const [editPay,setEditPay]       = useState<ReceiptRecord|null>(null);
  const [showRefund,setShowRefund] = useState(false);
  const [amtPaid,setAmtPaid]       = useState("");
  const [disAmt,setDisAmt]         = useState("0");
  const [otherAmt,setOtherAmt]     = useState("0");
  const [payType,setPayType]       = useState("Cash");
  const [remark,setRemark]         = useState("");
  const [saving,setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getBillingPatients({ BranchId:1, FromDate:fromDate, ToDate:toDate2, PaymentStatus:statusFilter, PatientName:search });
      setPatients(rows);
    } catch (e:any) { Alert.alert("Error", e.message||"Failed to load"); }
    finally { setLoading(false); }
  }, [fromDate,toDate2,statusFilter,search]);

  useFocusEffect(useCallback(()=>{ load(); },[load]));

  const openBill = async (p: BillingPatient) => {
    setSelected(p); setBillLoad(true); setBill(null);
    try { setBill(await getPatientBill(p.PID)); }
    catch { setBill(null); }
    finally { setBillLoad(false); }
  };

  const selCharges  = selected?.Charges  ?? 0;
  const selPaid     = selected?.Paid     ?? 0;
  const selDiscount = selected?.Discount ?? 0;
  const selBalance  = selected?.Balance  ?? 0;

  const handleSavePayment = async () => {
    if (!selected) return;
    if (!amtPaid||Number(amtPaid)<=0) { Alert.alert("Required","Enter amount paid"); return; }
    setSaving(true);
    try {
      if (editPay) {
        await updatePayment({ RID:editPay.RID, AmtPaid:Number(amtPaid), PaymentType:payType, Username:user?.name||"admin", TransDate:new Date().toISOString(), DisAmt:Number(disAmt), DiscountRemark:remark||null, OtherCharges:Number(otherAmt), OtherChargeRemark:null, BankName:null, ChqNo:null, ChqDate:null, CardNo:null, CardName:null, CardType:null, CardTransactionID:null, OnlineTransType:null, OnlineTransID:null });
      } else {
        await savePayment({ PID:selected.PID, BranchId:1, AmtPaid:Number(amtPaid), DisAmt:Number(disAmt), DiscountRemark:remark, OtherCharges:Number(otherAmt), OtherChargeRemark:"", PaymentType:payType, Username:user?.name||"admin", TransDate:new Date().toISOString(), Remark:remark, BankName:"", ChqNo:"", ChqDate:null, CardNo:"", CardName:"", CardType:"", CardTransactionID:"", OnlineTransType:"", OnlineTransID:"" });
      }
      Alert.alert("Success", editPay?"Payment updated":"Payment saved");
      setShowPay(false); setEditPay(null); openBill(selected); load();
    } catch (e:any) { Alert.alert("Error", e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const handleRefund = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveRefund({ PID:selected.PID, BranchId:1, Username:user?.name||"admin", PaymentType:payType, TransDate:new Date().toISOString(), Remark:remark||"Refund", BankName:null, ChqNo:null, ChqDate:null, CardNo:null, CardName:null, CardType:null, CardTransactionID:null, OnlineTransType:null, OnlineTransID:null });
      Alert.alert("Success","Refund processed"); setShowRefund(false); openBill(selected); load();
    } catch (e:any) { Alert.alert("Error",e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const openAddPayment = () => { setAmtPaid(""); setDisAmt("0"); setOtherAmt("0"); setPayType("Cash"); setRemark(""); setEditPay(null); setShowPay(true); };
  const openEditPayment = (p:ReceiptRecord) => { setAmtPaid(String(p.AmtPaid)); setDisAmt(String(p.DisAmt??0)); setOtherAmt(String(p.OtherCharges??0)); setPayType(p.PaymentType); setRemark(p.DiscountRemark??""); setEditPay(p); setShowPay(true); };

  return (
    <View style={[s.root,{paddingTop:Math.max(insets.top,0)}]}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation?.goBack()} style={s.backBtn}><Feather name="arrow-left" size={22} color="#FFF"/></TouchableOpacity>
        <View style={{flex:1}}><Text style={s.headerTitle}>Billing Desk</Text><Text style={s.headerSub}>Payments and receipts</Text></View>
        <TouchableOpacity style={s.iconBtn} onPress={load}><Feather name="refresh-cw" size={18} color="#FFF"/></TouchableOpacity>
      </View>

      <View style={s.filterRow}>
        <View style={{flex:1, flexDirection:'row', alignItems:'center', gap:8}}>
          <TextInput style={[s.dateInput, {flex:1, flexShrink:1}]} value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted}/>
          <Text style={{color:COLORS.textSecondary, marginHorizontal:4, fontSize:12, fontWeight:'600'}}>to</Text>
          <TextInput style={[s.dateInput, {flex:1, flexShrink:1}]} value={toDate2} onChangeText={setToDate2} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted}/>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={load}><Feather name="search" size={16} color="#FFF"/></TouchableOpacity>
      </View>

      <View style={s.filterTabsRow}>
        {STATUS_FILTERS.map(f=>(
          <TouchableOpacity key={f} style={[s.chip,statusFilter===f&&s.chipActive]} onPress={()=>setStatus(f)}>
            <Text style={[s.chipText,statusFilter===f&&s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchBar}>
        <Feather name="search" size={15} color={COLORS.textMuted} style={{marginRight:8}}/>
        <TextInput style={s.searchInput} placeholder="Search patient name or mobile..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={load} returnKeyType="search"/>
        {search.length>0&&<TouchableOpacity onPress={()=>setSearch("")}><Feather name="x" size={14} color={COLORS.textMuted}/></TouchableOpacity>}
      </View>

      {loading?<View style={s.centre}><ActivityIndicator size="large" color={COLORS.primary}/></View>:
        <FlatList data={patients} keyExtractor={(item)=>String(item.PID)} contentContainerStyle={{padding:16}}
          ListFooterComponent={<View style={{height:80}}/>}
          ListEmptyComponent={<View style={s.centre}><MaterialCommunityIcons name="receipt-text-outline" size={52} color={COLORS.textMuted}/><Text style={s.emptyTxt}>No billing records found</Text></View>}
          renderItem={({item})=>{
            const c=statusColor(item.Paid??0, item.Balance??0);
            return(
              <TouchableOpacity style={s.card} onPress={()=>openBill(item)} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={s.avatar}><Text style={s.avatarTxt}>{((item.Patname||item.PatientName)||"?").charAt(0).toUpperCase()}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={s.name}>{item.intial} {item.Patname}</Text>
                    <Text style={s.meta}>PT{String(item.PatRegID||item.PID).padStart(6,"0")}  {item.Patphoneno||"---"}</Text>
                    <Text style={s.meta}>{item.CenterName}  {fmtDate(item.Patregdate)}</Text>
                    <Text style={s.tests} numberOfLines={1}>{item.testname}</Text>
                  </View>
                  <View style={[s.badge,{backgroundColor:c.bg}]}><Text style={[s.badgeTxt,{color:c.color}]}>{c.label}</Text></View>
                </View>
                <View style={s.amtRow}>
                  {([["Total",item.Charges,COLORS.textPrimary],["Paid",item.Paid,COLORS.success],["Disc",item.Discount,"#F59E0B"],["Due",item.Balance,item.Balance>0?COLORS.danger:COLORS.success]] as [string,any,string][]).map(([lbl,val,col])=>(
                    <View key={lbl} style={s.amtItem}><Text style={s.amtLabel}>{lbl}</Text><Text style={[s.amtVal,{color:col}]}>{fmtAmt(val)}</Text></View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      }

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={()=>setSelected(null)}>
        <View style={s.overlay}><View style={[s.sheet,{paddingBottom:Math.max(insets.bottom,20)}]}>
          <View style={s.drag}/>
          <TouchableOpacity style={s.closeX} onPress={()=>setSelected(null)}><Feather name="x" size={22} color={COLORS.textSecondary}/></TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sheetTitle}>{selected?.intial} {selected?.Patname}</Text>
            <Text style={s.sheetSub}>PT{String(selected?.PatRegID||selected?.PID||0).padStart(6,"0")}  {selected?.CenterName}  Dr: {(selected?.RefDr||"").trim()}</Text>
            <View style={s.summaryBox}>
              {([["Total",selCharges,COLORS.textPrimary],["Paid",selPaid,COLORS.success],["Discount",selDiscount,"#F59E0B"],["Balance Due",selBalance,selBalance>0?COLORS.danger:COLORS.success]] as [string,number,string][]).map(([l,v,c])=>(
                <View key={l} style={s.sumRow}><Text style={s.sumLabel}>{l}</Text><Text style={[s.sumVal,{color:c}]}>{fmtAmt(v)}</Text></View>
              ))}
            </View>
            <Text style={s.sheetSub}>Tests: {selected?.testname}</Text>
            <View style={{flexDirection:"row",gap:10,marginVertical:16}}>
              <TouchableOpacity style={[s.actionBtn,{backgroundColor:COLORS.primary}]} onPress={openAddPayment}>
                <Feather name="plus" size={15} color="#FFF"/><Text style={s.actionBtnTxt}>Add Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn,{backgroundColor:"#F59E0B"}]} onPress={()=>{setRemark("");setPayType("Cash");setShowRefund(true);}}>
                <MaterialCommunityIcons name="cash-refund" size={15} color="#FFF"/><Text style={s.actionBtnTxt}>Refund</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.secLabel}>Receipt History</Text>
            {billLoading?<ActivityIndicator color={COLORS.primary} style={{marginTop:12}}/>:
              (bill?.Receipts??[]).length===0?<Text style={s.emptyTxt}>No receipts yet</Text>:
              (bill?.Receipts??[]).map((r,i)=>(
                <View key={r.RID} style={s.payRow}>
                  <View style={{flex:1}}>
                    <Text style={s.payAmt}>{fmtAmt(r.AmtPaid)}<Text style={s.payType}>  ({r.PaymentType})</Text></Text>
                    <Text style={s.paySub}>{fmtDate(r.transdate)}  by {r.username}  Rcpt#{r.ReceiptNo}</Text>
                    {(r.DisAmt>0)&&<Text style={s.paySub}>Disc: {fmtAmt(r.DisAmt)}</Text>}
                    {!!r.DiscountRemark&&<Text style={s.paySub}>{r.DiscountRemark}</Text>}
                  </View>
                  <TouchableOpacity style={s.iconAct} onPress={()=>openEditPayment(r)}><Feather name="edit-2" size={14} color={COLORS.primary}/></TouchableOpacity>
                  <TouchableOpacity style={s.iconAct} onPress={()=>Alert.alert("Delete Receipt","Delete receipt #"+r.ReceiptNo+"?",[{text:"Cancel",style:"cancel"},{text:"Delete",style:"destructive",onPress:async()=>{try{await deletePayment(r.RID);openBill(selected!);load();}catch(e:any){Alert.alert("Error",e.message);}}}])}><Feather name="trash-2" size={14} color={COLORS.danger}/></TouchableOpacity>
                </View>
              ))
            }
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={showPay} transparent animationType="slide" onRequestClose={()=>setShowPay(false)}>
        <View style={s.overlay}><View style={[s.sheet,{paddingBottom:Math.max(insets.bottom,20)}]}>
          <View style={s.drag}/>
          <Text style={s.sheetTitle}>{editPay?"Edit Receipt":"Add Payment"}</Text>
          <Text style={s.sheetSub}>{selected?.intial} {selected?.Patname}  Balance: {fmtAmt(selBalance)}</Text>
          <ScrollView style={{marginTop:16}}>
            <Text style={s.fldLabel}>Amount Paid *</Text>
            <TextInput style={s.input} value={amtPaid} onChangeText={setAmtPaid} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted}/>
            <Text style={s.fldLabel}>Discount</Text>
            <TextInput style={s.input} value={disAmt} onChangeText={setDisAmt} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted}/>
            <Text style={s.fldLabel}>Other Charges</Text>
            <TextInput style={s.input} value={otherAmt} onChangeText={setOtherAmt} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted}/>
            <Text style={s.fldLabel}>Payment Type</Text>
            <View style={s.ptRow}>{PAYMENT_TYPES.map(pt=><TouchableOpacity key={pt} style={[s.ptBtn,payType===pt&&s.ptActive]} onPress={()=>setPayType(pt)}><Text style={[s.ptTxt,payType===pt&&s.ptActiveTxt]}>{pt}</Text></TouchableOpacity>)}</View>
            <Text style={s.fldLabel}>Remark</Text>
            <TextInput style={[s.input,{height:65}]} value={remark} onChangeText={setRemark} multiline placeholder="Optional..." placeholderTextColor={COLORS.textMuted}/>
            <View style={{flexDirection:"row",gap:10,marginTop:16}}>
              <TouchableOpacity style={[s.actionBtn,{flex:1,backgroundColor:COLORS.textSecondary}]} onPress={()=>setShowPay(false)}><Text style={s.actionBtnTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn,{flex:2,backgroundColor:COLORS.primary}]} onPress={handleSavePayment} disabled={saving}>
                {saving?<ActivityIndicator color="#FFF" size="small"/>:<Text style={s.actionBtnTxt}>{editPay?"Update":"Save"}</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={showRefund} transparent animationType="slide" onRequestClose={()=>setShowRefund(false)}>
        <View style={s.overlay}><View style={[s.sheet,{paddingBottom:Math.max(insets.bottom,20)}]}>
          <View style={s.drag}/>
          <Text style={s.sheetTitle}>Process Refund</Text>
          <Text style={s.sheetSub}>{selected?.intial} {selected?.Patname}</Text>
          <View style={{marginTop:16}}>
            <Text style={s.fldLabel}>Payment Type</Text>
            <View style={s.ptRow}>{PAYMENT_TYPES.map(pt=><TouchableOpacity key={pt} style={[s.ptBtn,payType===pt&&s.ptActive]} onPress={()=>setPayType(pt)}><Text style={[s.ptTxt,payType===pt&&s.ptActiveTxt]}>{pt}</Text></TouchableOpacity>)}</View>
            <Text style={s.fldLabel}>Remark</Text>
            <TextInput style={[s.input,{height:70}]} value={remark} onChangeText={setRemark} multiline placeholder="Reason..." placeholderTextColor={COLORS.textMuted}/>
            <View style={{flexDirection:"row",gap:10,marginTop:16}}>
              <TouchableOpacity style={[s.actionBtn,{flex:1,backgroundColor:COLORS.textSecondary}]} onPress={()=>setShowRefund(false)}><Text style={s.actionBtnTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn,{flex:2,backgroundColor:"#F59E0B"}]} onPress={handleRefund} disabled={saving}>
                {saving?<ActivityIndicator color="#FFF" size="small"/>:<Text style={s.actionBtnTxt}>Process Refund</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex:1, backgroundColor:COLORS.background },
  header:        { flexDirection:"row", alignItems:"center", backgroundColor:COLORS.primary, paddingHorizontal:16, paddingTop:16, paddingBottom:14, gap:12 },
  backBtn:       { width:36, height:36, borderRadius:10, backgroundColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center" },
  iconBtn:       { width:36, height:36, borderRadius:10, backgroundColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center" },
  headerTitle:   { fontSize:18, fontWeight:"800", color:"#FFF" },
  headerSub:     { fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 },
  filterRow:     { flexDirection:"row", alignItems:"center", padding:12, backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border, gap:6 },
  filterTabsRow:{ flexDirection:"row", alignItems:"center", marginHorizontal:16, marginBottom:12, gap:12 },
  dateInput:     { height:40, borderWidth:1, borderColor:COLORS.border, borderRadius:8, paddingHorizontal:10, fontSize:13, color:COLORS.textPrimary, backgroundColor:COLORS.background },
  searchBtn:     { height:40, width:40, backgroundColor:COLORS.primary, borderRadius:8, alignItems:"center", justifyContent:"center" },
  chip:          { flex:1, paddingHorizontal:14, paddingVertical:12, borderRadius:18, borderWidth:1, borderColor:COLORS.border, backgroundColor:COLORS.surface, alignItems:"center", justifyContent:"center", minHeight:48 },
  chipActive:    { backgroundColor:COLORS.primary, borderColor:COLORS.primary },
  chipText:      { fontSize:12, color:COLORS.textSecondary, fontWeight:"600" },
  chipTextActive:{ color:"#FFF", fontWeight:"700" },
  searchBar:     { flexDirection:"row", alignItems:"center", marginHorizontal:16, marginVertical:8, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:12, paddingHorizontal:12, height:44 },
  searchInput:   { flex:1, fontSize:13, color:COLORS.textPrimary },
  centre:        { alignItems:"center", paddingTop:60 },
  emptyTxt:      { fontSize:14, color:COLORS.textMuted, marginTop:10, textAlign:"center" },
  card:          { backgroundColor:COLORS.surface, borderRadius:14, borderWidth:1, borderColor:COLORS.border, marginBottom:12, elevation:1, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.04, shadowRadius:6 },
  cardTop:       { flexDirection:"row", alignItems:"flex-start", padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border },
  avatar:        { width:44, height:44, borderRadius:22, backgroundColor:COLORS.primaryLight, alignItems:"center", justifyContent:"center", marginRight:12 },
  avatarTxt:     { fontSize:18, fontWeight:"800", color:COLORS.primaryDark },
  name:          { fontSize:14, fontWeight:"700", color:COLORS.textPrimary, marginBottom:2 },
  meta:          { fontSize:11, color:COLORS.textSecondary, marginBottom:1 },
  tests:         { fontSize:11, color:COLORS.textMuted, marginTop:2 },
  badge:         { paddingHorizontal:8, paddingVertical:4, borderRadius:10, alignSelf:"flex-start" },
  badgeTxt:      { fontSize:11, fontWeight:"700" },
  amtRow:        { flexDirection:"row", paddingHorizontal:14, paddingVertical:10 },
  amtItem:       { flex:1, alignItems:"center" },
  amtLabel:      { fontSize:10, color:COLORS.textMuted, fontWeight:"500", marginBottom:3 },
  amtVal:        { fontSize:13, fontWeight:"700" },
  overlay:       { flex:1, backgroundColor:"rgba(0,0,0,0.45)", justifyContent:"flex-end" },
  sheet:         { backgroundColor:COLORS.surface, borderTopLeftRadius:22, borderTopRightRadius:22, padding:20, maxHeight:"92%" },
  drag:          { width:36, height:4, backgroundColor:COLORS.border, borderRadius:2, alignSelf:"center", marginBottom:16 },
  closeX:        { position:"absolute", top:18, right:18, zIndex:1 },
  sheetTitle:    { fontSize:17, fontWeight:"800", color:COLORS.textPrimary, marginBottom:4 },
  sheetSub:      { fontSize:12, color:COLORS.textSecondary, marginBottom:10 },
  summaryBox:    { backgroundColor:COLORS.background, borderRadius:12, padding:14, marginBottom:12, borderWidth:1, borderColor:COLORS.border },
  sumRow:        { flexDirection:"row", justifyContent:"space-between", paddingVertical:6, borderBottomWidth:1, borderBottomColor:COLORS.divider },
  sumLabel:      { fontSize:13, color:COLORS.textSecondary },
  sumVal:        { fontSize:14, fontWeight:"700" },
  actionBtn:     { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", borderRadius:10, paddingVertical:12, gap:6 },
  actionBtnTxt:  { color:"#FFF", fontSize:13, fontWeight:"700" },
  secLabel:      { fontSize:13, fontWeight:"800", color:COLORS.textPrimary, marginBottom:10 },
  payRow:        { flexDirection:"row", alignItems:"flex-start", paddingVertical:12, borderBottomWidth:1, borderBottomColor:COLORS.divider },
  payAmt:        { fontSize:14, fontWeight:"700", color:COLORS.textPrimary },
  payType:       { fontSize:12, color:COLORS.textSecondary, fontWeight:"400" },
  paySub:        { fontSize:11, color:COLORS.textSecondary, marginTop:2 },
  iconAct:       { padding:8 },
  fldLabel:      { fontSize:12, fontWeight:"600", color:COLORS.textSecondary, marginBottom:6, marginTop:10 },
  input:         { borderWidth:1, borderColor:COLORS.border, borderRadius:8, paddingHorizontal:12, height:44, fontSize:14, color:COLORS.textPrimary, backgroundColor:COLORS.background },
  ptRow:         { flexDirection:"row", gap:8, flexWrap:"wrap", marginBottom:4 },
  ptBtn:         { paddingHorizontal:14, paddingVertical:8, borderRadius:8, borderWidth:1, borderColor:COLORS.border, backgroundColor:COLORS.background },
  ptActive:      { backgroundColor:COLORS.primary, borderColor:COLORS.primary },
  ptTxt:         { fontSize:13, color:COLORS.textSecondary, fontWeight:"500" },
  ptActiveTxt:   { color:"#FFF", fontWeight:"700" },
});

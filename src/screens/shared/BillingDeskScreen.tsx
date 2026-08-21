import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import BlinkingEmergencyBulb from "../../components/BlinkingEmergencyBulb";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../utils/constants";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getBillingPatients, getPatientBill, savePayment, updatePayment, saveRefund, deletePayment, getBillingCenters, BillingPatient, PatientBill, ReceiptRecord, BillingCenter, generateBillDocument } from "../../services/billingService";

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
  const [searchName,setSearchName] = useState("");
  const [searchMobile,setSearchMobile] = useState("");
  const [searchRegNo,setSearchRegNo] = useState("");
  const [searchCenter,setSearchCenter] = useState<number>(0);
  const [centers,setCenters] = useState<BillingCenter[]>([]);
  const [showCenter, setShowCenter] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [saving,setSaving]         = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<number|null>(null);
  const [generating, setGenerating] = useState(false);

  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptRecord|null>(null);



  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getBillingPatients({ 
        BranchId:1, 
        FromDate:fromDate, 
        ToDate:toDate2, 
        PaymentStatus:statusFilter, 
        PatientName:searchName,
        MobileNo: searchMobile,
        PatRegID: searchRegNo ? Number(searchRegNo) : 0,
        CenterCode: searchCenter
      });
      setPatients(rows);
    } catch (e:any) { Alert.alert("Error", e.message||"Failed to load"); }
    finally { setLoading(false); }
  }, [fromDate,toDate2,statusFilter,searchName,searchMobile,searchRegNo,searchCenter]);

  useFocusEffect(useCallback(()=>{ 
    getBillingCenters(1).then(c => setCenters(c)).catch(()=>{});
    load(); 
  },[load]));

  const openBill = async (p: BillingPatient) => {
    if (selected?.PID === p.PID) {
      setSelected(null);
      setBill(null);
      return;
    }
    setSelected(p); setBillLoad(true); setBill(null); setSelectedReceipt(null);
    try { 
      const b = await getPatientBill(p.PID);
      setBill(b); 
      if (b?.Receipts?.length && b.Receipts.length > 0) setSelectedReceipt(b.Receipts[0].ReceiptNo);
    }
    catch { setBill(null); }
    finally { setBillLoad(false); }
  };

  const handleGenerateBill = async (p: BillingPatient) => {
    if (!selectedReceipt) { Alert.alert('Error', 'Please select a receipt first'); return; }
    setGenerating(true);
    try {
      const url = 'https://dn8labapi.liferelier.in/api/ReceiptTemplate/Generate';
      const fileUri = (FileSystem.documentDirectory || '') + 'Receipt_' + selectedReceipt + '.pdf';
      const payload = JSON.stringify({ BranchId: 1, DocumentType: 'RECEIPT', ReceiptNo: selectedReceipt });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: 'base64' });
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            } else {
              Alert.alert('Success', 'PDF downloaded to ' + fileUri);
            }
          } catch(e:any) {
            Alert.alert('Error', 'Failed to save or share PDF: ' + e.message);
          }
        };
        reader.readAsDataURL(blob);
      } else {
        Alert.alert('Error', 'Failed to generate PDF. Server returned ' + response.status);
      }
    } catch (e:any) {
      Alert.alert('Error', e.message || 'Failed to download receipt');
    } finally {
      setGenerating(false);
    }
  };

  const selCharges  = selected?.Charges  ?? 0;
  const selDiscount = selected?.Discount ?? 0;
  // Always derive balance from the latest fetched bill data when available,
  // so partial payments are reflected correctly without needing a full list reload.
  const selPaid = bill?.Patient?.[0]?.Paid ?? selected?.Paid ?? 0;
  const selBalance = bill?.Patient?.[0]?.Balance ?? selected?.Balance ?? 0;

  const handleSavePayment = async () => {
    if (!selected) return;
    if (!amtPaid||Number(amtPaid)<=0) { Alert.alert("Required","Enter amount paid"); return; }
    if (!editPay && Number(amtPaid) > selBalance) { Alert.alert("Invalid Amount", `Payment cannot exceed the current balance of ${fmtAmt(selBalance)}`); return; }
    setSaving(true);
    try {
      if (editPay) {
        await updatePayment({ RID:editPay.RID, AmtPaid:Number(amtPaid), PaymentType:payType, Username:user?.name||"admin", TransDate:new Date().toISOString(), DisAmt:Number(disAmt), DiscountRemark:remark||null, OtherCharges:Number(otherAmt), OtherChargeRemark:null, BankName:null, ChqNo:null, ChqDate:null, CardNo:null, CardName:null, CardType:null, CardTransactionID:null, OnlineTransType:null, OnlineTransID:null });
      } else {
        await savePayment({ PID:selected.PID, BranchId:1, AmtPaid:Number(amtPaid), DisAmt:Number(disAmt), DiscountRemark:remark, OtherCharges:Number(otherAmt), OtherChargeRemark:"", PaymentType:payType, Username:user?.name||"admin", TransDate:new Date().toISOString(), Remark:remark, BankName:"", ChqNo:"", ChqDate:null, CardNo:"", CardName:"", CardType:"", CardTransactionID:"", OnlineTransType:"", OnlineTransID:"" });
      }
      Alert.alert("Success", editPay?"Payment updated":"Payment saved");
      setShowPay(false); setEditPay(null);
      // Reload both the bill detail (for accurate selBalance) and the full list
      setBillLoad(true);
      try {
        const [freshBill, freshList] = await Promise.all([
          getPatientBill(selected.PID),
          getBillingPatients({ BranchId:1, FromDate:fromDate, ToDate:toDate2, PaymentStatus:statusFilter, PatientName:searchName, MobileNo:searchMobile, PatRegID:searchRegNo ? Number(searchRegNo) : 0, CenterCode:searchCenter }),
        ]);
        setBill(freshBill);
        if (freshBill?.Receipts?.length) setSelectedReceipt(freshBill.Receipts[0].ReceiptNo);
        setPatients(freshList);
        // Update selected with the freshest patient record so the card shows correct Due
        const updatedPatient = freshList.find(p => p.PID === selected.PID);
        if (updatedPatient) setSelected(updatedPatient);
      } catch { /* ignore refresh errors — payment already saved */ }
      finally { setBillLoad(false); }
    } catch (e:any) { Alert.alert("Error", e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const handleRefund = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveRefund({ PID:selected.PID, BranchId:1, Username:user?.name||"admin", PaymentType:payType, TransDate:new Date().toISOString(), Remark:remark||"Refund", BankName:null, ChqNo:null, ChqDate:null, CardNo:null, CardName:null, CardType:null, CardTransactionID:null, OnlineTransType:null, OnlineTransID:null });
      Alert.alert("Success","Refund processed"); setShowRefund(false);
      setBillLoad(true);
      try {
        const [freshBill, freshList] = await Promise.all([
          getPatientBill(selected.PID),
          getBillingPatients({ BranchId:1, FromDate:fromDate, ToDate:toDate2, PaymentStatus:statusFilter, PatientName:searchName, MobileNo:searchMobile, PatRegID:searchRegNo ? Number(searchRegNo) : 0, CenterCode:searchCenter }),
        ]);
        setBill(freshBill);
        if (freshBill?.Receipts?.length) setSelectedReceipt(freshBill.Receipts[0].ReceiptNo);
        setPatients(freshList);
        const updatedPatient = freshList.find(p => p.PID === selected.PID);
        if (updatedPatient) setSelected(updatedPatient);
      } catch { /* ignore */ }
      finally { setBillLoad(false); }
    } catch (e:any) { Alert.alert("Error",e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const openAddPayment = () => { setAmtPaid(selBalance > 0 ? String(selBalance) : ""); setDisAmt("0"); setOtherAmt("0"); setPayType("Cash"); setRemark(""); setEditPay(null); setShowPay(true); };
  const openEditPayment = (p:ReceiptRecord) => { setAmtPaid(String(p.AmtPaid)); setDisAmt(String(p.DisAmt??0)); setOtherAmt(String(p.OtherCharges??0)); setPayType(p.PaymentType); setRemark(p.DiscountRemark??""); setEditPay(p); setShowPay(true); };

  return (
    <View style={[s.root,{paddingTop:Math.max(insets.top,0)}]}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation?.goBack()} style={s.backBtn}><Feather name="arrow-left" size={22} color="#FFF"/></TouchableOpacity>
        <View style={{flex:1}}><Text style={s.headerTitle}>Billing Desk</Text><Text style={s.headerSub}>Payments and receipts</Text></View>
        <TouchableOpacity style={s.iconBtn} onPress={load}><Feather name="refresh-cw" size={18} color="#FFF"/></TouchableOpacity>
      </View>

      <View style={s.filterCard}>
        <TouchableOpacity style={s.filterHeader} onPress={() => setFilterExpanded(!filterExpanded)} activeOpacity={0.7}>
          <View style={{flexDirection:"row", alignItems:"center"}}>
            <Feather name="search" size={16} color="#FFF" style={{marginRight:8}} />
            <Text style={s.filterHeaderTxt}>Bill Desk Search</Text>
          </View>
          <Feather name={filterExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
        </TouchableOpacity>
        
        {filterExpanded && (
          <View style={s.filterBody}>
            <Text style={s.fldLabel}>From Date *</Text>
            <View style={s.inputWrapper}>
              <Feather name="calendar" size={16} color={COLORS.textMuted} style={s.inputIcon} />
              <TextInput style={s.inputInner} value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted}/>
            </View>

            <Text style={s.fldLabel}>To Date *</Text>
            <View style={s.inputWrapper}>
              <Feather name="calendar" size={16} color={COLORS.textMuted} style={s.inputIcon} />
              <TextInput style={s.inputInner} value={toDate2} onChangeText={setToDate2} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted}/>
            </View>

            <Text style={s.fldLabel}>Center</Text>
            <TouchableOpacity style={[s.input, {justifyContent:'center'}]} onPress={()=>setShowCenter(true)}>
              <Text style={{color:searchCenter===0?COLORS.textMuted:COLORS.textPrimary}}>{searchCenter===0?"All Center":centers.find(c=>c.CenterCode===searchCenter)?.CenterName||"All Center"}</Text>
            </TouchableOpacity>

            <Text style={s.fldLabel}>Patient Name</Text>
            <TextInput style={s.input} value={searchName} onChangeText={setSearchName} placeholder="Patient Name" placeholderTextColor={COLORS.textMuted}/>

            <Text style={s.fldLabel}>Mobile No</Text>
            <TextInput style={s.input} value={searchMobile} onChangeText={setSearchMobile} keyboardType="phone-pad" placeholder="Mobile" placeholderTextColor={COLORS.textMuted}/>

            <Text style={s.fldLabel}>Reg No</Text>
            <TextInput style={s.input} value={searchRegNo} onChangeText={setSearchRegNo} keyboardType="numeric" placeholder="Reg No" placeholderTextColor={COLORS.textMuted}/>

            <Text style={s.fldLabel}>Payment Status</Text>
            <View style={s.radioRow}>
              {["All","Pending","Paid"].map(opt => (
                <TouchableOpacity key={opt} style={s.radioOption} onPress={()=>setStatus(opt)}>
                  <MaterialCommunityIcons name={statusFilter===opt ? "radiobox-marked" : "radiobox-blank"} size={20} color={statusFilter===opt ? COLORS.primary : COLORS.textMuted}/>
                  <Text style={s.radioTxt}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{flexDirection:"row", gap:10, marginTop:16}}>
              <TouchableOpacity style={s.btnPrimary} onPress={() => { setFilterExpanded(false); load(); }}>
                <Feather name="search" size={16} color="#FFF"/>
                <Text style={s.btnPrimaryTxt}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={() => {
                setFromDate(toDate(new Date(today.getFullYear(),today.getMonth(),1)));
                setToDate2(toDate(today));
                setSearchCenter(0); setSearchName(""); setSearchMobile(""); setSearchRegNo(""); setStatus("All");
              }}>
                <Feather name="refresh-ccw" size={16} color="#FFF"/>
                <Text style={s.btnPrimaryTxt}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {loading?<View style={s.centre}><ActivityIndicator size="large" color={COLORS.primary}/></View>:
        <FlatList data={patients} keyExtractor={(item)=>String(item.PID)} contentContainerStyle={{padding:16}}
          ListFooterComponent={<View style={{height:80}}/>}
          ListEmptyComponent={<View style={s.centre}><MaterialCommunityIcons name="receipt-text-outline" size={52} color={COLORS.textMuted}/><Text style={s.emptyTxt}>No billing records found</Text></View>}
          renderItem={({item})=>{
            const c=statusColor(item.Paid??0, item.Balance??0);
            const isExp = selected?.PID === item.PID;
            if (isExp) {
              return (
                <View style={s.cardExpanded}>
                  <View style={s.expActionRow}>
                    <Text style={s.expActionLabel}>Pay Bill</Text>
                    <TouchableOpacity style={[s.expActionBtn, {backgroundColor: item.Balance > 0 ? COLORS.primary : COLORS.success}]} onPress={item.Balance > 0 ? () => { setSelected(item); openAddPayment(); } : undefined}>
                      <Text style={s.expActionBtnTxt}>{item.Balance > 0 ? "Pay Bill" : "Paid"}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.expActionRow}>
                    <Text style={s.expActionLabel}>Refund</Text>
                    <TouchableOpacity style={[s.expActionBtn, {backgroundColor: "#F59E0B"}]} onPress={()=>{setSelected(item); setRemark("");setPayType("Cash");setShowRefund(true);}}>
                      <Text style={s.expActionBtnTxt}>{item.Paid > 0 ? "Refund" : "No Refund"}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.expActionRow}>
                    <Text style={s.expActionLabel}>Receipt</Text>
                    <View style={s.expSelect}>
                      {billLoading ? <ActivityIndicator size="small" color={COLORS.primary}/> : (
                        <Text style={s.expSelectTxt}>{selectedReceipt ? selectedReceipt : "No Receipt"}</Text>
                      )}
                      <Feather name="chevron-down" size={16} color={COLORS.textSecondary}/>
                    </View>
                  </View>
                  <View style={s.expActionRow}>
                    <Text style={s.expActionLabel}>Bill</Text>
                    <TouchableOpacity style={[s.expActionBtn, {backgroundColor: COLORS.tealDark || "#0F766E"}]} onPress={()=>handleGenerateBill(item)} disabled={generating}>
                      {generating ? <ActivityIndicator size="small" color="#FFF"/> : <Text style={s.expActionBtnTxt}>Bill</Text>}
                    </TouchableOpacity>
                  </View>
                  <View style={s.expDetailsBox}>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Status</Text><View style={[s.badge,{backgroundColor:c.bg}]}><Text style={[s.badgeTxt,{color:c.color}]}>{c.label}</Text></View></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Date</Text><Text style={s.expDetailVal}>{fmtDate(item.Patregdate)}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Reg No</Text><Text style={s.expDetailVal}>{item.PatRegID}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Name</Text><Text style={s.expDetailVal}>{item.Patname}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Age</Text><Text style={s.expDetailVal}>{item.Age}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Sex</Text><Text style={s.expDetailVal}>{item.sex}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Ref Dr</Text><Text style={s.expDetailVal}>{item.RefDr}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Center</Text><Text style={s.expDetailVal}>{item.CenterName}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Test</Text><Text style={s.expDetailVal}>{item.testname}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Charges</Text><Text style={s.expDetailVal}>{fmtAmt(item.Charges)}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Paid</Text><Text style={s.expDetailVal}>{fmtAmt(item.Paid)}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Disc</Text><Text style={s.expDetailVal}>{fmtAmt(item.Discount)}</Text></View>
                    <View style={s.expDetailRow}><Text style={s.expDetailLabel}>Balance</Text><Text style={s.expDetailVal}>{fmtAmt(item.Balance)}</Text></View>
                  </View>
                  <TouchableOpacity style={s.expLessBtn} onPress={()=>setSelected(null)}>
                    <Feather name="chevron-up" size={16} color={COLORS.primaryDark || "#115E59"}/>
                    <Text style={s.expLessTxt}>Less</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return(
              <TouchableOpacity style={s.card} onPress={()=>openBill(item)} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={s.avatar}><Text style={s.avatarTxt}>{((item.Patname||item.PatientName)||"?").charAt(0).toUpperCase()}</Text></View>
                  <View style={{flex:1}}>
                    <View style={{flexDirection:"row", alignItems:"center", gap:6}}>
                      <Text style={s.name}>{item.intial} {item.Patname}</Text>
                      {item.Isemergency && <BlinkingEmergencyBulb size={18} />}
                    </View>
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

      <Modal visible={showPay} transparent animationType="slide" onRequestClose={()=>setShowPay(false)}>
        <View style={s.overlay}><View style={[s.sheet,{paddingBottom:Math.max(insets.bottom,20)}]}>
          <View style={s.drag}/>
          <Text style={s.sheetTitle}>{editPay?"Edit Receipt":"Add Payment"}</Text>
          <Text style={s.sheetSub}>{selected?.intial} {selected?.Patname}  Balance: {fmtAmt(selBalance)}</Text>
          <ScrollView style={{marginTop:16}}>
            <Text style={s.fldLabel}>Balance Amount *</Text>
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
                {saving?<ActivityIndicator color="#FFF" size="small"/>:<Text style={s.actionBtnTxt}>{editPay?"Update":"Pay Bill"}</Text>}
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

      <Modal visible={showCenter} transparent animationType="slide" onRequestClose={()=>setShowCenter(false)}>
        <View style={s.overlay}><View style={[s.sheet,{paddingBottom:Math.max(insets.bottom,20)}]}>
          <View style={s.drag}/>
          <Text style={s.sheetTitle}>Select Center</Text>
          <ScrollView style={{marginTop:12, maxHeight:400}}>
            <TouchableOpacity style={s.payRow} onPress={()=>{setSearchCenter(0);setShowCenter(false);}}>
              <Text style={s.payAmt}>All Center</Text>
              {searchCenter===0&&<Feather name="check" size={18} color={COLORS.primary}/>}
            </TouchableOpacity>
            {centers.map((c, i)=>(
              <TouchableOpacity key={c.CenterCode ? c.CenterCode + '-' + i : String(i)} style={s.payRow} onPress={()=>{setSearchCenter(c.CenterCode);setShowCenter(false);}}>
                <Text style={s.payAmt}>{c.CenterName}</Text>
                {searchCenter===c.CenterCode&&<Feather name="check" size={18} color={COLORS.primary}/>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View></View>
      </Modal>
    
      <Modal visible={showReceiptPreview} transparent animationType="slide" onRequestClose={()=>setShowReceiptPreview(false)}>
        <View style={s.overlay}>
          <View style={[s.sheet, {paddingBottom: Math.max(insets.bottom, 20), maxHeight: '85%'}]}>
            <View style={s.drag}/>
            <TouchableOpacity style={s.closeX} onPress={()=>setShowReceiptPreview(false)}><Feather name="x" size={22} color={COLORS.textSecondary}/></TouchableOpacity>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{alignItems: 'center', marginBottom: 20}}>
                <Text style={{fontSize: 22, fontWeight: '800', color: COLORS.primaryDark}}>RECEIPT</Text>
                <Text style={{fontSize: 13, color: COLORS.textSecondary, marginTop: 4}}>{selected?.CenterName || 'Center'}</Text>
              </View>

              <View style={s.summaryBox}>
                <View style={s.sumRow}><Text style={s.sumLabel}>Receipt No</Text><Text style={s.sumVal}>#{previewReceipt?.ReceiptNo}</Text></View>
                <View style={s.sumRow}><Text style={s.sumLabel}>Date</Text><Text style={s.sumVal}>{fmtDate(previewReceipt?.transdate || '')}</Text></View>
                <View style={s.sumRow}><Text style={s.sumLabel}>Patient</Text><Text style={s.sumVal}>{selected?.intial} {selected?.Patname}</Text></View>
                <View style={s.sumRow}><Text style={s.sumLabel}>Reg No</Text><Text style={s.sumVal}>PT{String(selected?.PatRegID||selected?.PID||0).padStart(6,"0")}</Text></View>
                <View style={s.sumRow}><Text style={s.sumLabel}>Tests</Text><Text style={s.sumVal} numberOfLines={2}>{selected?.testname}</Text></View>
              </View>

              <Text style={s.secLabel}>Payment Details</Text>
              <View style={s.summaryBox}>
                <View style={s.sumRow}><Text style={s.sumLabel}>Payment Mode</Text><Text style={s.sumVal}>{previewReceipt?.PaymentType}</Text></View>
                {previewReceipt?.OtherCharges ? <View style={s.sumRow}><Text style={s.sumLabel}>Other Charges</Text><Text style={s.sumVal}>{fmtAmt(previewReceipt.OtherCharges)}</Text></View> : null}
                {previewReceipt?.DisAmt ? <View style={s.sumRow}><Text style={s.sumLabel}>Discount</Text><Text style={s.sumVal}>{fmtAmt(previewReceipt.DisAmt)}</Text></View> : null}
                <View style={[s.sumRow, {borderBottomWidth: 0, paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: COLORS.divider}]}>
                  <Text style={[s.sumLabel, {fontWeight: '700', color: COLORS.textPrimary}]}>Total Amount Paid</Text>
                  <Text style={[s.sumVal, {fontSize: 18, color: COLORS.success}]}>{fmtAmt(previewReceipt?.AmtPaid)}</Text>
                </View>
              </View>

              <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
                <TouchableOpacity style={[s.actionBtn, {backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border}]} onPress={()=>setShowReceiptPreview(false)}>
                  <Text style={[s.actionBtnTxt, {color: COLORS.textPrimary}]}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  filterCard:    { margin:16, backgroundColor:COLORS.surface, borderRadius:12, borderWidth:1, borderColor:COLORS.border, overflow:"hidden", elevation:2, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:4 },
  filterHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:COLORS.tealDark || "#0F766E", paddingHorizontal:14, paddingVertical:12 },
  filterHeaderTxt: { color:"#FFF", fontSize:14, fontWeight:"700" },
  filterBody:    { padding:14 },
  inputWrapper:  { flexDirection:"row", alignItems:"center", borderWidth:1, borderColor:COLORS.border, borderRadius:8, backgroundColor:COLORS.background, height:44, paddingHorizontal:12 },
  inputIcon:     { marginRight:8 },
  inputInner:    { flex:1, fontSize:14, color:COLORS.textPrimary },
  radioRow:      { flexDirection:"row", alignItems:"center", gap:16, marginTop:4 },
  radioOption:   { flexDirection:"row", alignItems:"center", gap:6 },
  radioTxt:      { fontSize:14, color:COLORS.textPrimary },
  btnPrimary:    { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", backgroundColor:"#1D4ED8", borderRadius:8, paddingVertical:12, gap:8 },
  btnSecondary:  { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", backgroundColor:"#6B7280", borderRadius:8, paddingVertical:12, gap:8 },
  btnPrimaryTxt: { color:"#FFF", fontSize:14, fontWeight:"700" },
  cardExpanded:  { backgroundColor:"#FFF", borderRadius:12, borderWidth:1, borderColor:COLORS.border, overflow:"hidden", elevation:2, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:4, marginBottom:16 },
  expActionRow:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:COLORS.border },
  expActionLabel:{ fontSize:14, color:COLORS.textSecondary, fontWeight:"500" },
  expActionBtn:  { paddingHorizontal:16, paddingVertical:6, borderRadius:6, minWidth:80, alignItems:"center" },
  expActionBtnTxt:{ color:"#FFF", fontSize:13, fontWeight:"700" },
  expSelect:     { flexDirection:"row", alignItems:"center", borderWidth:1, borderColor:COLORS.border, borderRadius:6, paddingHorizontal:10, paddingVertical:6, minWidth:120, justifyContent:"space-between" },
  expSelectTxt:  { fontSize:13, color:COLORS.textPrimary },
  expDetailsBox: { backgroundColor:"#E0F2FE", padding:16, margin:12, borderRadius:8 },
  expDetailRow:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
  expDetailLabel:{ fontSize:13, color:"#0369A1", fontWeight:"500", flex:1 },
  expDetailVal:  { fontSize:13, color:"#0C4A6E", fontWeight:"700", flex:2, textAlign:"right" },
  expLessBtn:    { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingVertical:12, borderTopWidth:1, borderTopColor:COLORS.border },
  expLessTxt:    { color:COLORS.primaryDark || "#115E59", fontWeight:"600", marginLeft:6, fontSize:13 },
});

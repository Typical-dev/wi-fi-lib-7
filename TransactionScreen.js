import  React from 'react';
import { Text, View, StyleSheet, Image, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as firebase from 'firebase'
import db from './config'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Alert } from 'react-native';

export default class TransactionScreen extends React.Component{
  constructor(){
    super();
    this.state = {
      hasCameraPermissions: "",
      scanned:false,
      buttonState:"normal",
      scannedBookID: "",
      scannedStudentID: "",
      transactionMessage: "",
    }
  }
  getCameraPermissions = async (id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA) 
    this.setState({hasCameraPermissions:status === "granted",buttonState:id, scanned:false})
  }

  handleBarCodeScanner = async ({type,data}) => {
    const {buttonState} = this.state
    if(buttonState === "BookID"){
      this.setState({scanned:true, scannedBookID:data, buttonState:"normal"})
    }else if(buttonState === "StudentID"){
      this.setState({scanned:true, scannedStudentID:data, buttonState:"normal"})
    }
  }

  handleTransaction = async() => {
    // var transactionMessage
    // db.collection('books').doc(this.state.scannedBookID).get()
    // .then((doc) => {
    //   var book = doc.data()
    //   if(book.availablity){
    //     this.initiateBookIssue()
    //     transactionMessage = 'bookIssued'
    //   }else{
    //     this.initiateBookReturn()
    //     transactionMessage = 'bookReturned'
      //}
  //   }) 
  //   this.setState({transactionMessage:transactionMessage})
   var transactionType = await this.checkBookAvailablity()
   if(!transactionType){
     Alert.alert("This Book Doesnt Exist In The Database")
     this.setState({scannedStudentID:"", scannedStudentID:""})
   }else if(transactionType === "Issue"){
     var isStudentEligible = await this.checkStudentEligiblityForIssue()
     if(isStudentEligible){
       this.initiateBookIssue()
       Alert.alert("Book Issued To Student")
     } 
   }else{
     var isStudentEligible = await this.checkStudentEligiblityForReturn()
     if(isStudentEligible){
       this.initiateBookReturn()
       Alert.alert("Book Returned")
     }
   }
   }

   checkBookAvailablity = async() => {
     const bookRef = await db.collection("books").where("bookID", "==", this.state.scannedBookID).get()
     var transactionType = ""
     if(bookRef.docs.length == 0){
       transactionType = false
     }else{
      bookRef.docs.map((doc) => {
         var book = doc.data()
         if(book.bookAvailability){
           transactionType = "Issue"
         }else{
           transactionType = "return"
         }
      }
      )
     }
     return transactionType
   }

   checkStudentEligiblityForIssue = async() => {
     const studentRef = await db.collection("students").where("StudentID","==", this.state.scannedStudentID).get()
     var isStudentEligible = ""
     if(studentRef.docs.length == 0){
       this.setState({scannedStudentID:"", scannedStudentID:""})
       isStudentEligible = false
       Alert.alert("This StudentID Doesnt Exist In The Database")
     }else{
       studentRef.docs.map((doc) => {
         var student = doc.data()
         if(student.noOfBooksIssued < 2){
           isStudentEligible = true
         }else{
           isStudentEligible = false
           Alert.alert("The Student Has Already Issued 2 Books")
           this.setState({scannedStudentID:"", scannedStudentID:""})
         }
       })
     }
     return isStudentEligible
   }

   checkStudentEligiblityForReturn = async() => {
    const transactionRef = await db.collection("transactions").where("bookID","==", this.state.scannedBookID).limit(1).get()
    var isStudentEligible = ""
      transactionRef.docs.map((doc) => {
        var lastBookTransaction = doc.data()
        if(lastBookTransaction.studentId == this.state.scannedStudentID){
          isStudentEligible = true
        }else{
          isStudentEligible = false
          Alert.alert("This Book Was Not Issued To The Student")
          this.setState({scannedStudentID:"", scannedStudentID:""})
        }
      })
    return isStudentEligible
}
  initiateBookIssue = async() => {
    db.collection("transactions").add({
      studentId:this.state.scannedStudentID,
      bookId: this.state.scannedBookID,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'issue',
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability:false,
    })
    db.collection('students').doc(this.state.scannedStudentID).update({
      noOfBooksIssued:firebase.firestore.fieldValue.increment(1)
    })
    ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
    this.setState({scannedBookID:"", scannedStudentID:""})
  }

  initiateBookReturn = async() => {
    db.collection("transactions").add({
      studentId:this.state.scannedStudentID,
      bookId: this.state.scannedBookID,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'return',
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability:true,
    })
    db.collection('students').doc(this.state.scannedStudentID).update({
      noOfBooksIssued:firebase.firestore.fieldValue.increment(-1)
    })
    ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
    this.setState({scannedBookID:"", scannedStudentID:""})
  }
 render(){
     const hasCameraPermissions = this.state.hasCameraPermissions
     const scanned = this.state.scanned
     const buttonState = this.state.buttonState
     if(buttonState != "normal"&&hasCameraPermissions){
         return(
             <BarCodeScanner onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanner} style = {StyleSheet.absoluteFillObject}/>
         )
     }else if(
         buttonState === "normal"
     ){
   return(
       <KeyboardAvoidingView style = {styles.container}>
       <View>
         <Image source = {require("../assets/booklogo.jpg")} style = {{width:200, height:200}} />
         <Text style = {{textAlign:"center", fontSize: 30}}>Wi-Fi-Library</Text>
       </View>
       <View style = {styles.inputView}>
       <TextInput style = {styles.inputBox} placeholder = "BookID" onChangeText = {text => this.setState({scannedBookID:text})}
         value = {this.state.scannedBookID}/>
       <TouchableOpacity style = {styles.scanButton} onPress ={async()=> {this.getCameraPermissions("BookID")}}>
     <Text style = {styles.buttonText}>Scan-QR-Code</Text>
     </TouchableOpacity>

     <TextInput style = {styles.inputBox} placeholder = "StudentID" onChangeText = {text => this.setState({scannedStudentID:text})}
        value = {this.state.scannedStudentID}/>
       <TouchableOpacity style = {styles.scanButton} onPress ={async()=> {this.getCameraPermissions("StudentID")}}>
     <Text style = {styles.buttonText}>Scan-QR-Code</Text>
     </TouchableOpacity>
     </View>
     <TouchableOpacity style = {styles.submitButton} onPress = {async()=>{this.handleTransaction();
     this.setState({scannedBookID:"", scannedStudentID:""})}}>
       <Text style = {styles.submitButtonText}>Sumbit</Text>
     </TouchableOpacity>
     </KeyboardAvoidingView>
   )
     }
 }
}
const styles = StyleSheet.create({
   container: { flex: 1, alignItems: "center", justifyContent: "center", },
    displayText: { fontSize: 15, textDecorationLine: "underline", },
     scanButton: { backgroundColor: "#2196F3", padding: 10, margin: 10, },
      submitButton: { backgroundColor: "#FBC02D", width: 100, height: 50, },
       submitButtonText: { padding: 10, textAlign: "center", fontSize: 20, fontWeight: "bold", color: "white", },
       });


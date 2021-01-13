import  React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import db from './config.js'

export default class SearchScreen extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
    }
  }

  componentDidMount = async() => {
    const query = await db.collection("transactions")
    query.docs.map((doc) => {
      this.setState({allTransactions:[...this.state.allTransactions, doc.data()]})
    })
  }

  fetchMoreTransactions = async() => {
    var enteredText = text.split("")
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase() === "B"){
    const transaction = await db.collection("transactions").where("bookID", "==", text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map((doc) => {
      this.setState({allTransactions:[...this.state.allTransactions, doc.data()],
      lastVisibleTransaction:doc})
    })
    }else if(enteredText[0].toUpperCase() === "S"){
    const transaction = await db.collection("transactions").where("studentID", "==", text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map((doc) => {
      this.setState({allTransactions:[...this.state.allTransactions, doc.data()],
      lastVisibleTransaction:doc})
    })
    } 
    // const query = await db.collection("transactions").startAfter(this.state.lastVisibleTransaction).limit(10).get()
    
  }

  searchTransactions = async() => {
    var enteredText = text.split("")
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase() === "B"){
      const transaction = await db.collection("transactions").where("bookID", "==", text).get()
      transaction.docs.map((doc) => {
        this.setState({allTransactions:[...this.state.allTransactions, doc.data()],
        lastVisibleTransaction:doc})
      })
    }else if(enteredText[0].toUpperCase() === "S"){
      const transaction = await db.collection("transactions").where("studentID", "==", text).get()
      transaction.docs.map((doc) => {
      this.setState({allTransactions:[...this.state.allTransactions, doc.data()],
      lastVisibleTransaction:doc})
      })
    }

    
  }
 render(){
   return(
    //  <ScrollView>{this.state.allTransactions.map((transaction, index) => {
    //    return(
    //      <View style = {{borderWidth:2}}key = {index}>
    //        <Text>{"bookID: "+transaction.bookID}</Text>
    //        <Text>{"studentID: "+transaction.studentID}</Text>
    //        <Text>{"transactionType: "+transaction.transactionType}</Text>
    //        <Text>{"date: "+transaction.date.toDate()}</Text>
    //        </View>
    //    )
    //  })}</ScrollView>
    <View style = {styles.container}>
    <View style = {styles.searchBar}>
      <TextInput styles = {styles.bar} placeholder = "Enter BookID and StudentID" onChangeText = {(text) => {
      this.setState({search:text})
    }}></TextInput>
    <TouchableOpacity style = {styles.searchButton} onPress = {() => {
      this.searchTransactions(this.state.search)
    }}><Text>search</Text>
    </TouchableOpacity>
    </View>
    <FlatList data = {this.state.allTransactions, renderItem = ({item}) => {
      <View style = {{borderWidth:2}}key = {index}>
          <Text>{"bookID: "+transaction.bookID}</Text>
            <Text>{"studentID: "+transaction.studentID}</Text>
            <Text>{"transactionType: "+transaction.transactionType}</Text>
            <Text>{"date: "+transaction.date.toDate()}</Text>
           </View>
    }}keyExtractor = {(item,index) => index.toString()}
    onEndReached = {this.fetchMoreTransactions} onEndReachedThreshold = {0.7}></FlatList>
    </View>
   )
 }
}

const styles = StyleSheet.create({
   container: { flex: 1, marginTop: 20, },
    searchBar: { flexDirection: "row", height: 40, width: "auto", borderWidth: 0.5, alignItems: "center", backgroundColor: "grey", },
     bar: { borderWidth: 2, height: 30, width: 300, paddingLeft: 10, },
      searchButton: { borderWidth: 1, height: 30, width: 50, alignItems: "center", justifyContent: "center", backgroundColor: "green", },
});
     
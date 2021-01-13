import * as React from 'react';
import * as firebase from 'firebase';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView } from 'react-native';
import { render } from 'react-dom';

export default class LoginScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            emailID: "",
            password: "",
        }
    }

    login = async (email,password) => {
        if (email && password) {
            try {
                const response = await firebase.auth().signInWithEmailAndPassword(email, password)
                if (response) {
                    this.props.navigation.navigate("Transaction")
                }
            }
            catch (error) {
                switch (error.code) {
                    case "auth/user-not-found":
                        Alert.alert("User Does Not Exist")
                        console.log(error.code)
                        break;
                    case "auth/invalid-email":
                        Alert.alert("Incorrect Email")
                        console.log(error.code)
                        break;
                    default:
                        Alert.alert("error "+ error.code)
                }
            }
        }
    }
    render() {
        return (
            <KeyboardAvoidingView style={{ alignItems: "center", marginTop: 20 }}>
                <View>
                    <Image source={require("../assets/booklogo.jpg")} style={{ width: 200, height: 200 }}>
                    </Image>
                    <Text style={{ textAlign: "center", fontSize: 30 }}>
                        Wili
                </Text>
                </View>
                <View>
                    <TextInput style={styles.loginBox} placeholder="abc@example.com" keyboardType="email-address" onChangeText={(text) => {
                        this.setState({
                            emailID: text,
                        })
                    }}>
                    </TextInput>
                    <TextInput style={styles.loginBox} placeholder="Enter Password" secureTextEntry={true} onChangeText={(text) => {
                        this.setState({
                            password: text,
                        })
                    }}>

                    </TextInput>
                </View>
                <View>
                    <TouchableOpacity style={{ height: 30, width: 50, borderWidth: 1, marginTop: 20, paddingTop: 5, borderRadius: 7 }} onPress={() => {
                        this.login(this.state.emailID, this.state.password)
                    }}>
                        <Text style={{ textAlign: "center" }}>
                            Login
                 </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}
const styles = StyleSheet.create({
    loginBox: { width: 300, height: 40, borderWidth: 1.5, fontSize: 20, margin: 10, paddingLeft: 10, },
});
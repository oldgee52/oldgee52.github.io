function Profile() {
    const [profile, setProfile] = React.useState();
    React.useEffect(async () => {
        const jwtToken = window.localStorage.getItem("jwtToken");

        if (!jwtToken) {
            window.alert("請先登入");
            try {
                await fb.loadScript();
                fb.init();
                const loginStatusresponse = await fb.getLoginStatus();
                async function loginStatus(response) {
                    if (response.status === "connected") {
                        return Promise.resolve(response.authResponse.accessToken);
                    }
                    const response_1 = await fb.login();
                    if (response_1.status === "connected") {
                        return Promise.resolve(response_1.authResponse.accessToken);
                    }
                    return await Promise.reject("登入失敗");
                }
                const accessToken = await loginStatus(loginStatusresponse);

                const jsonForSigninToken = await api.signin({
                    provider: "facebook",
                    access_token: accessToken,
                });

                function getProfileFromAPI(json) {
                    window.localStorage.setItem("jwtToken", json.data.access_token);
                    return api.getProfile(json.data.access_token);
                }
                const jsonForsetProfileData = await getProfileFromAPI(jsonForSigninToken);
                setProfile(jsonForsetProfileData.data);
                return;
            } catch (error) {
                window.alert(error);
                return;
            }
        }
        api.getProfile(jwtToken).then((json) => setProfile(json.data));
    }, []);
    return (
        <div className="profile">
            <div className="profile__title">會員基本資訊</div>
            {profile && (
                <div className="profile__content">
                    <img src={profile.picture} />
                    <div>{profile.name}</div>
                    <div>{profile.email}</div>
                    <button
                        onClick={() => {
                            window.FB.logout();
                            window.localStorage.removeItem("jwtToken");
                        }}
                    >
                        登出
                    </button>
                </div>
            )}
        </div>
    );
}

function App() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return (
        <React.Fragment>
            <Header cartItems={cart} />
            <Profile />
            <Footer />
        </React.Fragment>
    );
}

ReactDOM.render(<App />, document.querySelector("#root"));

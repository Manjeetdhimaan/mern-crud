import { Dispatch } from "@reduxjs/toolkit";

import http from "../../services/http/http.service";
import { userActions } from "./user-slice";
import { userBaseUrl } from "../../constants/api.constants";

const fetchUsers = (searchQuery?: string): any => {
    return async (dispatch: Dispatch): Promise<void> => {
        const fetchData = async () => {
            let query = 'get-users';
            if(searchQuery) {
                query = `get-users?search=${searchQuery}`
            }
            const response = await http.get(`${userBaseUrl}/${query}`);

            if (response && response.data && response.data.users) {
                const users = response.data.users;
                return users;
            } else {
                return [];
            }
        };

        try {
            const users = await fetchData();
            dispatch(
                userActions.setUsers({
                    users,
                })
            );
        } catch (error) { }
    };
};

export { fetchUsers };
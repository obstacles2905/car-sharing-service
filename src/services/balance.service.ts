import {dataSourceManager} from "../../server";
import {UserEntity} from "../entities/user.entity";

export async function getUserBalance(userId: number): Promise<number> {

    const user = await dataSourceManager.findOne(UserEntity, { where: {id: Number(userId)} });

    return user?.balance ?? 0;
}

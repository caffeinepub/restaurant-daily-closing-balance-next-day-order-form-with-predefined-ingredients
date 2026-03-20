/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface Meal { name: string; ingredients: Array<Ingredient>; }
export type Timestamp = bigint;
export interface Ingredient { name: string; category: string; }
export interface DailyRecord { meals: Array<Meal>; restaurantName: string; timestamp: Timestamp; }
export interface Restaurant { id: string; name: string; }
export interface RestaurantUser { username: string; password: string; restaurantName: string; }
export interface MasterCategory { id: string; name: string; }
export interface RawMaterial { id: string; name: string; category: string; }
export interface Category { name: string; }
export interface UserProfile { name: string; restaurantName: string; }

export interface backendInterface {
    seedDefaultData(): Promise<void>;
    addDailyRecord(meals: Array<Meal>, timestamp: Timestamp, restaurantName: string): Promise<bigint>;
    getAllDailyRecords(): Promise<Array<DailyRecord>>;
    getRestaurants(): Promise<Array<Restaurant>>;
    addRestaurant(name: string): Promise<void>;
    updateRestaurant(id: string, name: string): Promise<void>;
    deleteRestaurant(id: string): Promise<void>;
    getUsers(): Promise<Array<RestaurantUser>>;
    addUser(username: string, password: string, restaurantName: string): Promise<void>;
    updateUser(username: string, password: string, restaurantName: string): Promise<void>;
    deleteUser(username: string): Promise<void>;
    verifyUserLogin(username: string, password: string): Promise<[] | [string]>;
    getCategories(): Promise<Array<MasterCategory>>;
    addCategory(name: string): Promise<void>;
    updateCategory(id: string, name: string): Promise<void>;
    deleteCategory(id: string): Promise<void>;
    getRawMaterials(): Promise<Array<RawMaterial>>;
    getRawMaterialsByCategory(category: string): Promise<Array<RawMaterial>>;
    addRawMaterial(name: string, category: string): Promise<void>;
    updateRawMaterial(id: string, name: string, category: string): Promise<void>;
    deleteRawMaterial(id: string): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
    setAdminPassword(newPassword: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getIngredientsByCategory(category: string): Promise<Array<Ingredient>>;
}

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ) {}

    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try { return await fn(); } catch (e) { this.processError(e); throw new Error("unreachable"); }
        }
        return fn();
    }

    seedDefaultData(): Promise<void> { return this.call(() => this.actor.seedDefaultData()); }
    addDailyRecord(meals: Array<Meal>, timestamp: Timestamp, restaurantName: string): Promise<bigint> {
        return this.call(() => this.actor.addDailyRecord(meals, timestamp, restaurantName));
    }
    getAllDailyRecords(): Promise<Array<DailyRecord>> { return this.call(() => this.actor.getAllDailyRecords()); }
    getRestaurants(): Promise<Array<Restaurant>> { return this.call(() => this.actor.getRestaurants()); }
    addRestaurant(name: string): Promise<void> { return this.call(() => this.actor.addRestaurant(name)); }
    updateRestaurant(id: string, name: string): Promise<void> { return this.call(() => this.actor.updateRestaurant(id, name)); }
    deleteRestaurant(id: string): Promise<void> { return this.call(() => this.actor.deleteRestaurant(id)); }
    getUsers(): Promise<Array<RestaurantUser>> { return this.call(() => this.actor.getUsers()); }
    addUser(username: string, password: string, restaurantName: string): Promise<void> {
        return this.call(() => this.actor.addUser(username, password, restaurantName));
    }
    updateUser(username: string, password: string, restaurantName: string): Promise<void> {
        return this.call(() => this.actor.updateUser(username, password, restaurantName));
    }
    deleteUser(username: string): Promise<void> { return this.call(() => this.actor.deleteUser(username)); }
    verifyUserLogin(username: string, password: string): Promise<[] | [string]> {
        return this.call(() => this.actor.verifyUserLogin(username, password));
    }
    getCategories(): Promise<Array<MasterCategory>> { return this.call(() => this.actor.getCategories()); }
    addCategory(name: string): Promise<void> { return this.call(() => this.actor.addCategory(name)); }
    updateCategory(id: string, name: string): Promise<void> { return this.call(() => this.actor.updateCategory(id, name)); }
    deleteCategory(id: string): Promise<void> { return this.call(() => this.actor.deleteCategory(id)); }
    getRawMaterials(): Promise<Array<RawMaterial>> { return this.call(() => this.actor.getRawMaterials()); }
    getRawMaterialsByCategory(category: string): Promise<Array<RawMaterial>> {
        return this.call(() => this.actor.getRawMaterialsByCategory(category));
    }
    addRawMaterial(name: string, category: string): Promise<void> {
        return this.call(() => this.actor.addRawMaterial(name, category));
    }
    updateRawMaterial(id: string, name: string, category: string): Promise<void> {
        return this.call(() => this.actor.updateRawMaterial(id, name, category));
    }
    deleteRawMaterial(id: string): Promise<void> { return this.call(() => this.actor.deleteRawMaterial(id)); }
    verifyAdminPassword(password: string): Promise<boolean> { return this.call(() => this.actor.verifyAdminPassword(password)); }
    setAdminPassword(newPassword: string): Promise<void> { return this.call(() => this.actor.setAdminPassword(newPassword)); }
    getAllCategories(): Promise<Array<Category>> { return this.call(() => this.actor.getAllCategories()); }
    getIngredientsByCategory(category: string): Promise<Array<Ingredient>> {
        return this.call(() => this.actor.getIngredientsByCategory(category));
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}

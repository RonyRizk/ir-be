import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount } from '@/utils/utils';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-facilities',
  styleUrl: 'ir-facilities.css',
  shadow: true,
})
export class IrFacilities {
  render() {
    return (
      <Host>
        <div class="facilities-container space-y-5 bg-gray-100 p-6">
          <div class="flex  items-center gap-4">
            <ir-icons name="clock"></ir-icons>
            {app_store.property?.time_constraints.check_in_from && app_store.property?.time_constraints.check_in_till && (
              <p>
                {localizedWords.entries.Lcz_CheckInFromUntil.replace('%1', app_store.property?.time_constraints.check_in_from).replace(
                  '%2',
                  app_store.property?.time_constraints.check_in_till,
                )}
                {/* Check-in: from {app_store.property?.time_constraints.check_in_from} until {app_store.property?.time_constraints.check_in_till} */}
              </p>
            )}
            <p>
              {localizedWords.entries.Lcz_CheckOut}:{app_store.property?.time_constraints.check_out_till}
            </p>
          </div>
          {app_store.property?.internet_offering.public_internet_statement && (
            <div class="flex items-center gap-4">
              <ir-icons name="wifi"></ir-icons>
              <p>
                {localizedWords.entries.Lcz_PublicAreas}: <span class="text-[var(--ir-green)]">{app_store.property?.internet_offering.public_internet_statement}</span>
              </p>
              {app_store.property?.internet_offering.is_room_internet_free && (
                <p>
                  {localizedWords.entries.Lcz_Rooms}: <span class="text-[var(--ir-green)]">{localizedWords.entries.Lcz_FreeInternet}</span>
                </p>
              )}
            </div>
          )}
          {app_store.property?.parking_offering.title && (
            <div class="flex items-center gap-4">
              <ir-icons name="car"></ir-icons>
              <p>
                {app_store.property?.parking_offering.title}{' '}
                {Number(app_store.property?.parking_offering.pricing) > 0 && (
                  <span>
                    {localizedWords.entries.Lcz_At} {formatAmount(app_store.property?.parking_offering.pricing, app_store.userPreferences.currency_id)}
                  </span>
                )}
              </p>
            </div>
          )}
          {app_store.property?.pets_acceptance.title && (
            <div class="flex items-center gap-4">
              <ir-icons name="pets"></ir-icons>
              <p>{app_store.property?.pets_acceptance.title}</p>
            </div>
          )}
          {app_store.property?.baby_cot_offering.title && (
            <div class="flex items-center gap-4">
              <ir-icons name="bed"></ir-icons>
              <p>{app_store.property?.baby_cot_offering.title}</p>
            </div>
          )}
          {app_store.property?.amenities.some(a => !['property', 'activity', 'service'].includes(a.amenity_type)) && (
            <div class="flex flex-col flex-wrap gap-4 md:flex-row md:items-start md:justify-between md:gap-8 lg:gap-10">
              {/* hotel */}
              {app_store.property?.amenities.some(a => a.amenity_type === 'property') && (
                <div class="flex gap-4 ">
                  <ir-icons name="home"></ir-icons>
                  <ul>
                    <li class="text-start font-medium">{localizedWords.entries.Lcz_PropertyFacilities}</li>
                    {app_store.property?.amenities.map(aminity => {
                      if (aminity.amenity_type !== 'property') {
                        return null;
                      }
                      return (
                        <li key={aminity.code} class="text-start">
                          {aminity.description}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {app_store.property?.amenities.some(a => a.amenity_type === 'activity') && (
                <div class="flex gap-4">
                  <ir-icons name="football"></ir-icons>
                  <ul>
                    <li class="text-start font-medium">{localizedWords.entries.Lcz_Activities}</li>
                    {app_store.property?.amenities.map(aminity => {
                      if (aminity.amenity_type !== 'activity') {
                        return null;
                      }
                      return (
                        <li class="text-start" key={aminity.code}>
                          {aminity.description}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {app_store.property?.amenities.some(a => a.amenity_type === 'service') && (
                <div class="flex gap-4 ">
                  <ir-icons name="bell"></ir-icons>
                  <ul>
                    <li class="text-start font-medium">{localizedWords.entries.Lcz_Services}</li>
                    {app_store.property?.amenities.map(aminity => {
                      if (aminity.amenity_type !== 'service') {
                        return null;
                      }
                      return (
                        <li class="text-start" key={aminity.code}>
                          {aminity.description}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          {app_store.property?.description.food_and_beverage && (
            <div class="flex items-center gap-4">
              {/* utencils */}
              <ir-icons name="utencils"></ir-icons>
              <p>
                <span class="font-medium">{localizedWords.entries['Lcz_FoodAndbeverage:']} </span>
                <span innerHTML={app_store.property?.description.food_and_beverage}></span>
              </p>
            </div>
          )}
          {app_store.property?.allowed_cards?.length > 0 && (
            <div class="flex items-center gap-4">
              {/* credit card */}
              <ir-icons name="credit_card"></ir-icons>
              <p>
                <span class="font-medium">{localizedWords.entries.Lcz_AcceptedCreditCards} </span>
                {app_store.property?.allowed_cards.map((card, index) => {
                  return (
                    <span key={card.id}>
                      {card.name}
                      {index < app_store.property?.allowed_cards.length - 1 && <span> - </span>}
                    </span>
                  );
                })}
              </p>
            </div>
          )}
          {/* TODO: add the cancelation and guarentee */}
          {/* <div class="flex items-center gap-4">
           
            <ir-icons name="check"></ir-icons>
            <div>
             <p innerHTML=''></p>
            </div>
          </div> */}
          {app_store.property?.description.important_info && (
            <div class="flex items-center gap-4">
              {/* danger */}
              <ir-icons name="danger" svgClassName="text-red-500"></ir-icons>
              <div>
                <p innerHTML={app_store.property?.description.important_info}></p>
                <p innerHTML={app_store.property?.description.non_standard_conditions}></p>
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}

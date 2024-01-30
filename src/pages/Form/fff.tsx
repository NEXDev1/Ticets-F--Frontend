import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showAlert } from '../../components/tosterComponents/tost';
import { backend_Url } from '../../api/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface DrawTime {
  _id: string;
  drawTime: string;
}

interface TokenSet {
  tokenNumber: string;
  count: string;
  drawTime: string;
  date: Date | null;
}

const EntityForm: React.FC = () => {
  const [drawTimeList, setDrawTimeList] = useState<DrawTime[]>([]);
  const [defaultDrawTime, setDefaultDrawTime] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrawTimeList = async () => {
      try {
        const response = await axios.get<any>(
          `${backend_Url}/api/admin/enitity-draw-time-rang-list`,
        );
        if (response.data.status === 'success') {
          setDrawTimeList(response.data.drawTimeList);

          if (response.data.drawTimeList.length > 0) {
            const currentTime = new Date();
            const currentMinutes =
              currentTime.getHours() * 60 + currentTime.getMinutes();

            let closestDrawTime: DrawTime | null = null;
            let minTimeDifference = Infinity;

            response.data.drawTimeList.forEach((drawTime: DrawTime) => {
              if (typeof drawTime.drawTime === 'string') {
                const drawTimeDate = new Date(
                  `2000-01-01T${drawTime.drawTime}`,
                );
                const drawTimeMinutes =
                  drawTimeDate.getHours() * 60 + drawTimeDate.getMinutes();

                if (drawTimeMinutes >= currentMinutes) {
                  const timeDifference = Math.abs(
                    drawTimeMinutes - currentMinutes,
                  );

                  if (timeDifference < minTimeDifference) {
                    closestDrawTime = drawTime;
                    minTimeDifference = timeDifference;
                  }
                }
              }
            });

            if (closestDrawTime) {
              setDefaultDrawTime(closestDrawTime.drawTime);
            }
          }
        } else {
          console.error(
            'API request failed with status:',
            response.data.status,
          );
        }
      } catch (error) {
        console.error('Error fetching draw time list:', error);
      }
    };

    fetchDrawTimeList();
  }, []);

  const formik = useFormik({
    initialValues: {
      tokenSets: [
        { tokenNumber: '', count: '', drawTime: '', date: new Date() },
      ],
    },
    validationSchema: Yup.object().shape({
      tokenSets: Yup.array().of(
        Yup.object().shape({
          tokenNumber: Yup.string()
            .required('Token Number is required')
            .matches(/^\d+$/, 'Token Number must be a number')
            .min(1, 'Token Number must be at least 1 digit')
            .max(2, 'Token Number cannot be more than 2 digits'),
          count: Yup.string()
            .required('Token Count is required')
            .max(1000, 'Token Count cannot be more than 1000')
            .matches(
              /^[1-9]\d*$/,
              'Token Count must be a number greater than 0',
            ),
          drawTime: Yup.string().required('Draw Time is required'),
          date: Yup.date().required('Select a date'),
        }),
      ),
    }),
    onSubmit: async (values) => {
      console.log('values', values);

      const _id = localStorage.getItem('agentID');

      try {
        const formattedDate = values.tokenSets[0]?.date
          ?.toISOString()
          .split('T')[0];
        const response = await axios.post(
          `${backend_Url}/api/agent/add-entity`,
          {
            _id: _id,
            values,
          },
        );

        console.log('Entry Added', response.data);
        navigate('/');
      } catch (error: any) {
        console.error('Error adding entry:', error);
        showAlert(error?.response?.data?.error, 'error');
      }
    },
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-9 ">
        <div className="flex flex-col gap-9 ">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={formik.handleSubmit}>
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Add Token
                </h3>
              </div>

              {formik.values.tokenSets.map((tokenSet, index) => (
                <div key={index} className="flex flex-col gap-5.5 p-6.5">
                  <h2>Token {index + 1}</h2>
                  <div>
                    <label className="mb-3 block text-black dark:text-white">
                      Token Number
                    </label>
                    <input
                      type="text"
                      name={`tokenSets.${index}.tokenNumber`}
                      value={tokenSet.tokenNumber}
                      placeholder="Token Number"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary w-2/3 ${
                        formik.touched.tokenSets?.[index]?.tokenNumber &&
                        formik.errors.tokenSets?.[index]?.tokenNumber
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    {formik.touched.tokenSets?.[index]?.tokenNumber &&
                    formik.errors.tokenSets?.[index]?.tokenNumber ? (
                      <div className="text-red-500">
                        {formik.errors.tokenSets[index].tokenNumber}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-3 block text-black dark:text-white">
                      Token Count
                    </label>
                    <input
                      type="number"
                      name={`tokenSets.${index}.count`}
                      placeholder="Token Count"
                      value={tokenSet.count}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary w-2/3 ${
                        formik.touched.tokenSets?.[index]?.count &&
                        formik.errors.tokenSets?.[index]?.count
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    {formik.touched.tokenSets?.[index]?.count &&
                    formik.errors.tokenSets?.[index]?.count ? (
                      <div className="text-red-500">
                        {formik.errors.tokenSets[index].count}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-3 block text-black dark:text-white">
                      Draw Time
                    </label>
                    <select
                      name={`tokenSets.${index}.drawTime`}
                      value={tokenSet.drawTime}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary w-2/3 ${
                        formik.touched.tokenSets?.[index]?.drawTime &&
                        formik.errors.tokenSets?.[index]?.drawTime
                          ? 'border-red-500'
                          : ''
                      }`}
                    >
                      {drawTimeList.map((drawTime) => (
                        <option key={drawTime._id} value={drawTime.drawTime}>
                          {drawTime.drawTime}
                        </option>
                      ))}
                    </select>
                    {formik.touched.tokenSets?.[index]?.drawTime &&
                    formik.errors.tokenSets?.[index]?.drawTime ? (
                      <div className="text-red-500">
                        {formik.errors.tokenSets[index].drawTime}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-3 block text-black dark:text-white">
                      Select date
                    </label>
                    <DatePicker
                      selected={tokenSet.date}
                      onChange={(date) =>
                        formik.setFieldValue(`tokenSets.${index}.date`, date)
                      }
                      className={`rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary w-2/3 ${
                        formik.touched.tokenSets?.[index]?.date &&
                        formik.errors.tokenSets?.[index]?.date
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    {formik.touched.tokenSets?.[index]?.date &&
                    formik.errors.tokenSets?.[index]?.date ? (
                      <div className="text-red-500">
                        {formik.errors.tokenSets[index].date}
                      </div>
                    ) : null}
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        formik.setFieldValue(
                          'tokenSets',
                          formik.values.tokenSets.filter((_, i) => i !== index),
                        );
                      }}
                      className="mt-2 text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('tokenSets', [
                      ...formik.values.tokenSets,
                      {
                        tokenNumber: '',
                        count: '',
                        drawTime: defaultDrawTime,
                        date: new Date(),
                      },
                    ]);
                  }}
                  className="w-50 m-2 flex justify-center rounded bg-black p-3 font-medium text-gray mb-2"
                >
                  <span className="mr-2">
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                  Add Another Token
                </button>
              </div>

              <div className="flex justify-center mb-10 ">
                <button
                  type="submit"
                  className=" w-24 flex justify-center rounded bg-primary p-3 font-medium text-gray ml-5 "
                >
                  Save
                </button>
                <Link
                  to="/"
                  className=" w-24 flex justify-center rounded bg-primary p-3 font-medium text-gray ml-3"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntityForm;
